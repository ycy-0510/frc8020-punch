<script setup>
import { ref, reactive } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import * as XLSX from 'xlsx'
import { onMounted } from 'vue'
import Swal from 'sweetalert2'



// {
//     'userName':'realName'
//     'userName':'realName'
// }

const realName = reactive({})
const punchData = ref({})
const users = reactive([])

onMounted(() => {
    //get data from local storage
    const localDataP = localStorage.getItem('data')
    if (localDataP) {
        punchData.value = JSON.parse(localDataP)
    }
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
    console.log(realName.value)
    //set usernames
    for (const [key, value] of Object.entries(realName)) {
        users.push(key)
    }
    //sort by username
    users.sort((a, b) => {
        return a.localeCompare(b)
    })
});


const saveData = () => {
    localStorage.setItem('realName', JSON.stringify(realName));
    console.log(realName.value);
}

const saveAll = () => {
    saveData();
    Swal.fire({
        icon: 'success',
        title: 'Saved',
        showConfirmButton: false,
        timer: 1500
    })
}
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>Edit Real Name</h2>
                <div>

                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>UserName</th>
                                <th>realName</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user">
                                <td>{{ user }}</td>
                                <td><input type="text" v-model="realName[user]" class="form-control"></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="btn btn-primary my-3" @click="saveAll">Save All</button>
                </div>
            </div>
        </div>
    </div>
</template>
