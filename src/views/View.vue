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
const users = reactive([])
const maxHours = ref(0)
const compareRate = ref(0.25)

const sortIndex = ref(0)
const sortAsc = ref(true)

const clickCount = ref(0)

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
                if (!missingPunches.value[key]) {
                    missingPunches.value[key] = 0;
                }
                if (time.in || time.out) {
                    if (!time.in) {
                        missingPunches.value[key] = missingPunches.value[key] + 1;
                    }
                    if (!time.out) {
                        missingPunches.value[key] = missingPunches.value[key] + 1;
                    }
                }
            }
        }
        durationData.value[key] = total;
        if (total > maxHours.value) {
            maxHours.value = total;
        }
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
    //set usernames
    for (const [key, value] of Object.entries(realName)) {
        users.push(key)
    }
    //set missing punches
    for (const [key, value] of Object.entries(realName)) {
        if (!missingPunches.value[key]) {
            missingPunches.value[key] = 0;
        }
    }
    sortData();
});

const setSort = (index) => {
    if (sortIndex.value === index) {
        sortAsc.value = !sortAsc.value;
    } else {
        sortAsc.value = true;
        sortIndex.value = index;
    }
    sortData();
}

const sortData = () => {
    if (sortIndex.value === 0) {
        users.sort((a, b) => {
            return realName[a].localeCompare(realName[b])
        })
    } else if (sortIndex.value === 1) {
        users.sort((a, b) => {
            return durationData.value[a] - durationData.value[b]
        })
    } else if (sortIndex.value === 2) {
        users.sort((a, b) => {
            return missingPunches.value[a] - missingPunches.value[b]
        })
    }
    if (!sortAsc.value) {
        users.reverse();
    }
}

const exportXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(users.map(user => ({
        Name: realName[user],
        'Total Hours Worked': durationData.value[user].toFixed(2),
        'Total Missing Punches': missingPunches.value[user] !== undefined ? missingPunches.value[user] : 0
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const datetime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace(/[-:]/g, '');
    XLSX.writeFile(wb, `Report-${datetime}.xlsx`);
}

const handleTitleClick = () => clickCount.value++;
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2><a @click="handleTitleClick" href='#' class="text-dark text-decoration-none"> View</a></h2>
                <div class="card mb-3" v-if="clickCount == 5">
                    <div class="card-body">
                        <div class="form-group">
                            <label for="compareRate" class="form-label">Compare Rate: </label>
                            <input type="range" class="form-range" id="compareRate" v-model="compareRate" min="0"
                                max="1" step="0.01" @mousedown="isSliding = true" @mouseup="isSliding = false">
                            <span>{{ (compareRate * 100).toFixed(0) }}%</span>
                        </div>
                    </div>
                </div>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th scope="col"><a href="#" class="text-dark" @click="setSort(0)">Name
                                    <font-awesome-icon icon="fa-solid fa-sort-up"
                                        v-if="sortIndex == 0 && sortAsc == true" />
                                    <font-awesome-icon icon="fa-solid fa-sort-down"
                                        v-if="sortIndex == 0 && sortAsc == false" />
                                </a>
                            </th>
                            <th scope="col"><a href="#" class="text-dark" @click="setSort(1)">Total Hours Worked
                                    <font-awesome-icon icon="fa-solid fa-sort-up"
                                        v-if="sortIndex == 1 && sortAsc == true" />
                                    <font-awesome-icon icon="fa-solid fa-sort-down"
                                        v-if="sortIndex == 1 && sortAsc == false" />
                                </a></th>
                            <th scope="col"><a href="#" class="text-dark" @click="setSort(2)">Total Missing Punches
                                    <font-awesome-icon icon="fa-solid fa-sort-up"
                                        v-if="sortIndex == 2 && sortAsc == true" />
                                    <font-awesome-icon icon="fa-solid fa-sort-down"
                                        v-if="sortIndex == 2 && sortAsc == false" />
                                </a></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for=" user in users" :key="user"
                            :class="{ 'table-danger': durationData[user] / maxHours < compareRate && clickCount == 5 }">
                            <td>{{ realName[user] }}</td>
                            <td>{{ durationData[user].toFixed(2) }}</td>
                            <td>{{ missingPunches[user] ? missingPunches[user] : 0 }}</td>
                        </tr>
                    </tbody>
                </table>
                <button class="btn btn-primary my-3" @click="exportXlsx">Export</button>
            </div>
        </div>
    </div>
</template>
