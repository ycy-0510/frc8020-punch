<script setup>
import { ref, reactive } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import * as XLSX from 'xlsx'
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

const punchData = ref({})
const missingPunches = ref({})
const durationData = ref({})
const realName = reactive({})

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

//missingPunches(times)
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
    //convert punchData to durationData
    const tempData = punchData.value;
    //calculate durationData
    for (const [key, value] of Object.entries(tempData)) {
        let total = 0;
        for (const [date, time] of Object.entries(value)) {
            if (time.in && time.out) {
                if (time.in && time.out) {
                    const inTime = new Date(`2025-01-01T${time.in}:00`);
                    const outTime = new Date(`2025-01-01T${time.out}:00`);

                    const duration = (outTime - inTime) / 1000 / 60 / 60;
                    total += duration;
                    console.log(duration);

                }
            } else {
                console.log('missing punch')
                if (!time.in) {
                    missingPunches.value[key] = missingPunches.value[key] ? missingPunches.value[key] + 1 : 1;
                }
                if (!time.out) {
                    missingPunches.value[key] = missingPunches.value[key] ? missingPunches.value[key] + 1 : 1;
                }
            }
        }
        durationData.value[key] = total;
    }
    console.log(durationData.value);

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
});

const exportCsv = () => {
    //export to csv
    let csv = 'User Name,Total Hours Worked,Total Missing Punches\n';
    for (const [user, hours] of Object.entries(durationData.value)) {
        console.log(user, hours, missingPunches.value[user]);
        csv += `${realName[user]},${hours.toFixed(2)},${missingPunches.value[user] !== undefined ? missingPunches.value[user] : 0}\n`;
    }
    console.log(csv);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
}
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>View</h2>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th scope="col">User Name</th>
                            <th scope="col">Total Hours Worked</th>
                            <th scope="col">Total Missing Punches</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(hours, user) in durationData" :key="user">
                            <td>{{ realName[user] }}</td>
                            <td>{{ hours.toFixed(2) }}</td>
                            <td>{{ missingPunches[user] ? missingPunches[user] : 0 }}</td>
                        </tr>
                    </tbody>
                </table>
                <button class="btn btn-primary my-3" @click="exportCsv">Export</button>
            </div>
        </div>
    </div>
</template>
