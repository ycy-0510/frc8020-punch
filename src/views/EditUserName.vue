<script setup>
import { ref, reactive, computed } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import * as XLSX from 'xlsx'
import { onMounted } from 'vue'
import Swal from 'sweetalert2'



// {
//     'userName':'realName'
//     'userName':'realName'
// }


const realName = reactive({})
const userNameReplace = ref({})
const punchData = ref({})
const users = reactive([])

const showEditRealName = ref(true)
const showReplaceUserName = ref(false)

const selectedUserName = ref('')

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
    //fill missing realName
    for (const [key, value] of Object.entries(punchData.value)) {
        if (!realName[key]) {
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

    const localDataU = localStorage.getItem('userNameReplace')
    if (localDataU) {
        userNameReplace.value = JSON.parse(localDataU)
    }
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

const addUserNameReplace = () => {
    if (selectedUserName.value && !userNameReplace.value[selectedUserName.value]) {
        userNameReplace.value[selectedUserName.value] = '';
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Username already exists',
            showConfirmButton: false,
            timer: 1500
        })
    }
    selectedUserName.value = ''
}

const checkUserNameReplace = (key) => {
    if (userNameReplace.value[key] === key) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Cannot replace username with itself',
            showConfirmButton: false,
            timer: 1500
        })
        userNameReplace.value[key] = ''
    } else if (userNameReplace.value[userNameReplace.value[key]] === key) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Cannot create a loop',
            showConfirmButton: false,
            timer: 1500
        })
        userNameReplace.value[key] = ''
    }
}

const deleteUserNameReplace = (key) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            delete userNameReplace.value[key];
            Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            }
            )
        }
    })
}

const saveDataReplace = () => {
    localStorage.setItem('userNameReplace', JSON.stringify(userNameReplace.value));
    console.log(realName.value);
}

const saveAllReplace = () => {
    saveDataReplace();
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
            <div class="col-12 py-3">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" :class="{ active: showEditRealName }"
                            @click="showEditRealName = true; showReplaceUserName = false" id="edit-real-name-tab"
                            data-bs-toggle="tab" type="button" role="tab" aria-controls="edit-real-name"
                            aria-selected="true">Edit Real Name</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" :class="{ active: showReplaceUserName }"
                            @click="showEditRealName = false; showReplaceUserName = true" id="replace-user-name-tab"
                            data-bs-toggle="tab" type="button" role="tab" aria-controls="replace-user-name"
                            aria-selected="false">Replace User Name</button>
                    </li>
                </ul>
            </div>
            <div class="col-12 col-lg-9 py-2" v-show="showEditRealName">
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
            <div class="col-12 col-lg-9 py-2" v-show="showReplaceUserName">
                <h2>Replace User Name</h2>
                <div>
                    <div class="input-group mb-3">
                        <select class="form-select" v-model="selectedUserName">
                            <option value="" disabled selected>Select a username</option>
                            <option v-for="user in users" :key="user" :value="user">{{ user }}</option>
                        </select>
                        <button class="btn btn-secondary" @click="addUserNameReplace">Add</button>
                    </div>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>UserName</th>
                                <th>Replace to</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(value, key) in userNameReplace" :key="key">
                                <td>{{ key }}</td>
                                <td>
                                    <select v-model="userNameReplace[key]" class="form-select"
                                        @change="checkUserNameReplace(key)">
                                        <option value="" disabled selected>Select a username</option>
                                        <option v-for="user in users" :key="user" :value="user">{{ user }}</option>
                                    </select>
                                </td>
                                <td><button class="btn btn-danger" @click="deleteUserNameReplace(key)">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="btn btn-primary my-3" @click="saveAllReplace">Save All</button>
                </div>
            </div>
        </div>
    </div>
</template>
