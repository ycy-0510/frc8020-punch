<script setup>
import { ref, reactive, computed } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import * as XLSX from 'xlsx'
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

const selectedUser = ref('')
const punchData = ref({})
const editingdata = ref({})
const realName = reactive({})
const user = reactive([])

const allUsersDate = ref([])

const newDate = ref('')
const addDate = () => {
    if (newDate.value) {
        const date = new Date(newDate.value)
        const dateKey = date.toISOString().split('T')[0].replace(/-/g, '')
        console.log(dateKey)
        if (!editingdata.value[selectedUser.value][dateKey]) {

            editingdata.value[selectedUser.value][dateKey] = {
                in: null,
                out: null
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Date already exists',
                showConfirmButton: false,
                timer: 1500
            })
        }
    }
}

onMounted(() => {
    const today = new Date()
    newDate.value = today.toISOString().split('T')[0]
    const localDataP = localStorage.getItem('data')
    if (localDataP) {
        punchData.value = JSON.parse(localDataP)
    }
    console.log(punchData.value)
    const localData = localStorage.getItem('realName')
    if (localData) {
        const tempData = JSON.parse(localData)
        for (const [key, value] of Object.entries(tempData)) {
            realName[key] = value
        }
    } else {
        for (const [key, value] of Object.entries(punchData.value)) {
            realName[key] = key
        }
    }
    for (const [key, value] of Object.entries(realName)) {
        user.push(key)
    }
    user.sort((a, b) => {
        return realName[a].localeCompare(realName[b])
    })
    editingdata.value = JSON.parse(JSON.stringify(punchData.value))
});

const saveData = () => {
    localStorage.setItem('data', JSON.stringify(punchData.value))
    console.log(punchData.value)
}

const saveAll = () => {
    const editedData = editingdata.value[selectedUser.value];
    punchData.value[selectedUser.value] = editedData;
    saveData();
    editingdata.value = JSON.parse(JSON.stringify(punchData.value))
    Swal.fire({
        icon: 'success',
        title: 'Saved',
        showConfirmButton: false,
        timer: 1500
    })
}

const removeData = (key) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `You are deleting ${key}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            delete editingdata.value[selectedUser.value][key];
            Swal.fire(
                {
                    icon: 'success',
                    title: 'Deleted',
                    showConfirmButton: false,
                    timer: 1500
                }
            )
        }
    })
}

const getAllUsersDate = () => {
    if (selectedUser.value !== 'all') {
        return
    }
    allUsersDate.value = []
    for (const [key, value] of Object.entries(punchData.value)) {
        for (const date of Object.keys(value)) {
            if (!allUsersDate.value.includes(date)) {
                allUsersDate.value.push(date)
            }
        }
    }
    allUsersDate.value.sort()
    console.log(allUsersDate.value)
}

const addDatetoAll = () => {
    if (newDate.value) {
        const date = new Date(newDate.value)
        const dateKey = date.toISOString().split('T')[0].replace(/-/g, '')
        if (!allUsersDate.value.includes(dateKey)) {
            allUsersDate.value.push(dateKey)
            allUsersDate.value.sort()
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Date already exists',
                showConfirmButton: false,
                timer: 1500
            })
        }
    }
}

const removeDatatoAll = (date) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `You are deleting ${date}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            allUsersDate.value = allUsersDate.value.filter((value) => value !== date)
            Swal.fire(
                {
                    icon: 'success',
                    title: 'Deleted',
                    showConfirmButton: false,
                    timer: 1500
                }
            )
        }
    })
}

const saveAlltoAll = () => {
    let deleteCount = 0;
    let addCount = 0;
    for (const [key, value] of Object.entries(punchData.value)) {
        for (const date of allUsersDate.value) {
            if (!value[date]) {
                value[date] = {
                    in: null,
                    out: null
                }
                addCount++;
            }
        }
        for (const date of Object.keys(value)) {
            if (!allUsersDate.value.includes(date)) {
                delete value[date]
                deleteCount++;
            }
        }
    }
    saveData()
    editingdata.value = JSON.parse(JSON.stringify(punchData.value))
    Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: `Added ${addCount} and deleted ${deleteCount} dates`,
        showConfirmButton: false,
        timer: 1500
    })
}

const exportToXLSX = () => {
    const wb = XLSX.utils.book_new();
    if (selectedUser.value === 'all') {
        for (const [username, data] of Object.entries(punchData.value)) {
            const wsData = [['Date', 'In', 'Out']];
            for (const [date, times] of Object.entries(data)) {
                wsData.push([date, times.in, times.out]);
            }
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, realName[username] || username);
        }
    } else {
        const wsData = [['Date', 'In', 'Out']];
        for (const [date, times] of Object.entries(punchData.value[selectedUser.value])) {
            wsData.push([date, times.in, times.out]);
        }
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, realName[selectedUser.value] || selectedUser.value);
    }
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    XLSX.writeFile(wb, 'punchin-by-name-' + date + '.xlsx');
}
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>Edit By Name</h2>
                <div class="form-group py-3">
                    <label for="username">Select Username:</label>
                    <select id="username" v-model="selectedUser" class="form-control" @change="getAllUsersDate">
                        <option value="" disabled selected :value="''">Select a username</option>
                        <option v-for="username in user" :key="username" :value="username">
                            {{ realName[username] }} ({{ username }})
                        </option>
                        <option value="all">All</option>
                    </select>
                </div>
                <div v-if="selectedUser != '' && selectedUser != 'all'">
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
                            <tr v-for="(value, key) in editingdata[selectedUser]" :key="key"
                                :class="{ 'table-warning': (!value.in || !value.out) && !(!value.in && !value.out), 'table-secondary': !value.in && !value.out, }">
                                <td>{{ key }}</td>
                                <td><input type="time" v-model="value.in" class="form-control" /></td>
                                <td><input type="time" v-model="value.out" class="form-control" /></td>
                                <td><button class="btn btn-danger" @click="removeData(key)">Clear</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="row justify-content-between">
                        <div class="col text-start">
                            <button class="btn btn-primary my-3" @click="saveAll">Save All</button>
                        </div>
                        <div class="col text-end">
                            <button class="btn btn-success my-3" @click="exportToXLSX">Export</button>
                        </div>
                    </div>
                </div>
                <div v-else-if="selectedUser == 'all'">
                    <div class="form-group py-3">
                        <label for="newDate">Add Date:</label>
                        <input type="date" id="newDate" v-model="newDate" class="form-control" />
                        <button class="btn btn-primary mt-2" @click="addDatetoAll">Add Date</button>
                    </div>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="date in allUsersDate" :key="date">
                                <td>{{ date }}</td>
                                <td><button class="btn btn-danger" @click="removeDatatoAll(date)">Remove</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="row justify-content-between">
                        <div class="col text-start">
                            <button class="btn btn-primary my-3" @click="saveAlltoAll">Save All</button>
                        </div>
                        <div class="col text-end">
                            <button class="btn btn-success my-3" @click="exportToXLSX">Export</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
