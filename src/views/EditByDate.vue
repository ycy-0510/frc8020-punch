<script setup>
import { ref, reactive, onMounted } from 'vue';
import PageHeader from "../components/PageHeader.vue";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const selectedDate = ref('');
const punchData = ref({});
const editingDataByDate = reactive({});
const realName = reactive({});
const allDates = ref([]);
const users = reactive([]);

onMounted(() => {
    // Get data from local storage
    const localDataP = localStorage.getItem('data');
    if (localDataP) {
        punchData.value = JSON.parse(localDataP);
    }
    const localData = localStorage.getItem('realName');
    if (localData) {
        const tempData = JSON.parse(localData);
        for (const [key, value] of Object.entries(tempData)) {
            realName[key] = value;
        }
    } else {
        for (const [key, value] of Object.entries(punchData.value)) {
            realName[key] = key;
        }
    }
    //fill missing realName
    for (const [key, value] of Object.entries(punchData.value)) {
        if (!realName[key]) {
            realName[key] = key
        }
    }
    //set usernames
    for (const [key, value] of Object.entries(realName)) {
        users.push(key);
    }
    //sort by realName
    users.sort((a, b) => {
        return realName[a].localeCompare(realName[b]);
    });

    // Get all dates
    const datesSet = new Set();
    for (const userData of Object.values(punchData.value)) {
        for (const date of Object.keys(userData)) {
            datesSet.add(date);
        }
    }
    allDates.value = Array.from(datesSet).sort();
});

const getUsersByDate = () => {
    if (!selectedDate.value) return;
    for (const [username, userData] of Object.entries(punchData.value)) {
        if (userData[selectedDate.value]) {
            editingDataByDate[username] = { ...userData[selectedDate.value] };
        } else {
            editingDataByDate[username] = { in: null, out: null };
        }
    }
};

const saveAllByDate = () => {
    for (const [username, timeData] of Object.entries(editingDataByDate)) {
        if (!punchData.value[username]) {
            punchData.value[username] = {};
        }
        const originalData = punchData.value[username][selectedDate.value] || {};
        //check in data changed
        if (originalData.in !== timeData.in && timeData.in) {
            timeData.inedited = true;
        }
        //check out data changed
        if (originalData.out !== timeData.out && timeData.out) {
            timeData.outedited = true;
        }
        punchData.value[username][selectedDate.value] = timeData;
    }
    localStorage.setItem('data', JSON.stringify(punchData.value));
    //copy data to editingDataByDate
    getUsersByDate();
    Swal.fire({
        icon: 'success',
        title: 'Saved',
        showConfirmButton: false,
        timer: 1500
    });
};

const exportToXLSX = () => {
    const wb = XLSX.utils.book_new();
    if (selectedDate.value === 'all') {
        for (const date of allDates.value) {
            const wsData = [['Username', 'In', 'Out', 'I=', 'O=']];
            for (const [username, userData] of Object.entries(punchData.value)) {
                if (userData[date]) {
                    wsData.push([realName[username] || username, userData[date].in, userData[date].out, userData[date].inedited ? '=' : '', userData[date].outedited ? '=' : '']);
                }
            }
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, date);
        }
    } else {
        const wsData = [['Username', 'In', 'Out', 'I=', 'O=']];
        for (const [username, timeData] of Object.entries(editingDataByDate)) {
            wsData.push([realName[username] || username, timeData.in, timeData.out, timeData.inedited ? '=' : '', timeData.outedited ? '=' : '']);
        }
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, selectedDate.value);
    }
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    XLSX.writeFile(wb, 'punchin-by-date-' + date + '.xlsx');
};
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>Edit By Date</h2>
                <div class="form-group py-3">
                    <label for="date">Select Date:</label>
                    <select id="date" v-model="selectedDate" class="form-control" @change="getUsersByDate">
                        <option value="" disabled selected :value="''">Select a date</option>
                        <option v-for="date in allDates" :key="date" :value="date">
                            {{ date }}
                        </option>
                        <option value="all">All</option>
                    </select>
                </div>
                <div v-if="selectedDate && selectedDate !== 'all'">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>In</th>
                                <th>Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="username in users" :key="username">
                                <td>{{ realName[username] }}</td>
                                <td><input type="time" v-model="editingDataByDate[username].in" class="form-control"
                                        :class="{ 'bg-info-subtle': editingDataByDate[username].inedited }" /></td>
                                <td><input type="time" v-model="editingDataByDate[username].out" class="form-control"
                                        :class="{ 'bg-info-subtle': editingDataByDate[username].outedited }" /></td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="row justify-content-between">
                        <div class="col text-start">
                            <button class="btn btn-primary my-3" @click="saveAllByDate">Save All</button>
                        </div>
                        <div class="col text-end">
                            <button class="btn btn-success my-3" @click="exportToXLSX">Export</button>
                        </div>
                    </div>
                </div>
                <div v-else-if="selectedDate === 'all'">
                    <div class="row justify-content-between">
                        <div class="col text-start">
                            <button class="btn btn-success my-3" @click="exportToXLSX">Export</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
