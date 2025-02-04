<script setup>
import { ref, reactive,computed } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import * as XLSX from 'xlsx'
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

const selectedUser = ref('')
const punchData = ref({})
const editingdata = ref({})
const realName = reactive({})
const user = reactive([])

const newDate = ref('')
const addDate = () => {
    if (newDate.value) {
        const date = new Date(newDate.value)
        const dateKey = date.toISOString().split('T')[0].replace(/-/g, '')
        console.log(dateKey)
        editingdata.value[getUserName(selectedUser.value)][dateKey] = {
            in: null,
            out: null
        }
    }
}

// {
//     'userNume': {
//         "20250125":{
//             "in" : "08:00",
//             "out" : "17:00"
//         },
//         "20250126":{
//             "in" : "08:00",
//             "out" : null
//         }
//     }
// }

//durationData (hours worked)
// {
//     'userName':  1
//     'userName':  2
// }

onMounted(() => {
    //get data from local storage
    const localDataP = localStorage.getItem('data')
    if (localDataP) {
        punchData.value = JSON.parse(localDataP)
    }
    console.log(punchData.value)
    const localData = localStorage.getItem('realName')
    if (localData) {
        //set realName
        const tempData = JSON.parse(localData)
        for (const [key, value] of Object.entries(tempData)) {
            realName[key] = value
        }
    } else {
        for (const [key, value] of Object.entries(punchData.value)) {
            realName[key] = key
        }
    }
    //set usernames
    for (const [key, value] of Object.entries(realName)) {
        user.push(value)
    }
    editingdata.value = JSON.parse(JSON.stringify(punchData.value))
});

const save = (key) => {
    const editedData = editingdata.value[getUserName(selectedUser.value)][key];
    punchData.value[getUserName(selectedUser.value)][key] = editedData;
    saveData();
    editingdata.value = JSON.parse(JSON.stringify(punchData.value))
}

const saveData = () => {
    localStorage.setItem('data', JSON.stringify(punchData.value))
    console.log(punchData.value)
}

const saveAll = () => {
    const editedData = editingdata.value[getUserName(selectedUser.value)];
    punchData.value[getUserName(selectedUser.value)] = editedData;
    saveData();
    editingdata.value = JSON.parse(JSON.stringify(punchData.value))
    Swal.fire({
        icon: 'success',
        title: 'Saved',
        showConfirmButton: false,
        timer: 1500
    })
}

const getUserName = (name) => {
    //find username by realName
    for (const [key, value] of Object.entries(realName)) {
        if (value == name) {
            return key;
        }
    }
    return '';
};

const computedUser = computed(() => {
    return getUserName(selectedUser.value);
});
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>Edit</h2>
                <div class="form-group py-3">
                    <label for="username">Select Username:</label>
                    <select id="username" v-model="selectedUser" class="form-control">
                        <option value="" disabled selected :value="''">Select a username</option>
                        <option v-for="username in user" :key="username" :value="username">
                            {{ username }}
                        </option>
                    </select>
                </div>
                <div v-if="selectedUser != ''">
                    <!-- add date  -->
                    <div class="form-group py-3">
                        <label for="newDate">Add Date:</label>
                        <input type="date" id="newDate" v-model="newDate" class="form-control" />
                        <button class="btn btn-primary mt-2" @click="addDate">Add Date</button>
                    </div>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>In</th>
                                <th>Out</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(value, key) in editingdata[computedUser]" :key="key">
                                <td>{{ key }}</td>
                                <td><input type="time" v-model="value.in" class="form-control" /></td>
                                <td><input type="time" v-model="value.out" class="form-control" /></td>
                                <td><button class="btn btn-primary" @click="save(key)">Save</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="btn btn-primary my-3" @click="saveAll">Save All</button>
                </div>
            </div>
        </div>
    </div>
</template>
