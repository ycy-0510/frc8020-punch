<script setup>
import { ref } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import * as XLSX from 'xlsx'
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

const punchData = ref({})

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

onMounted(() => {
    //get data from local storage
    const localData = localStorage.getItem('data')
    if (localData) {
        punchData.value = JSON.parse(localData)
    }
    console.log(punchData.value)
});

const saveData = () => {
    localStorage.setItem('data', JSON.stringify(punchData.value))
    console.log(punchData.value)
}


const files = ref([]);

const handleFileChange = (event) => {
    files.value = Array.from(event.target.files);
};

const handleUpload = (event) => {
    event.preventDefault();
    let count = 0;
    files.value.forEach(file => {
        console.log(file.name);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const tempData = punchData.value;
                console.log(tempData);
                try {
                    json.forEach((row, rowIndex) => {
                        console.log(row);
                        if (row.length > 0 && row[0] && row[1] && row[2]) {
                            // Convert the date string in column A to a Date object and adjust to UTC+8
                            if (row[0]) {
                                let date = new Date(row[0]);
                                // Adjust to UTC+8
                                date.setHours(date.getHours() + 8);
                                row[0] = date;
                            }
                            console.log(`Row ${rowIndex + 1}: ${row[0]} ${row[1]} ${row[2]}`);
                            //set data
                            //if B column is in, set in time
                            //if B column is out, set out time
                            //if B column is null, do nothing
                            //date is row[0] iso date
                            const date = row[0].toISOString().split('T')[0].replace(/-/g, '')
                            const time = row[0].toISOString().split('T')[1].substring(0, 5)
                            if (row[1] === 'In') {
                                if (!tempData[row[2]]) {
                                    tempData[row[2]] = {}
                                }
                                //set {user}/{date}/in to row[0] time
                                if (!tempData[row[2]][date]) {
                                    tempData[row[2]][date] = {}
                                }
                                if (!tempData[row[2]][date].in) {
                                    tempData[row[2]][date].in = time
                                } else {
                                    //set to min of the two times
                                    tempData[row[2]][date].in = time < tempData[row[2]][date].in ? time : tempData[row[2]][date].in
                                }
                                count += 1;
                            } else if (row[1] === 'Out') {
                                if (!tempData[row[2]]) {
                                    tempData[row[2]] = {}
                                }
                                //set {user}/{date}/out to row[0] time
                                if (!tempData[row[2]][date]) {
                                    tempData[row[2]][date] = {}
                                }
                                if (!tempData[row[2]][date].out) {
                                    tempData[row[2]][date].out = time
                                } else {
                                    //set to max of the two times
                                    tempData[row[2]][date].out = time > tempData[row[2]][date].out ? time : tempData[row[2]][date].out
                                }
                                count += 1;
                            }
                        }
                    });
                    punchData.value = tempData
                    saveData()
                    console.log(`Total ${count} records processed`);
                    Swal.fire({
                        icon: 'success',
                        title: 'Upload Success',
                        text: `Total ${count} records processed`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Upload Failed',
                        text: 'Invalid file format',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    return;
                }
            };
            reader.readAsArrayBuffer(file);
        }
    });
};
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>Upload</h2>
                <form @submit.prevent="handleUpload">
                    <div class="mb-3">
                        <label for="fileInput" class="form-label">Upload XLSX File</label>
                        <input type="file" class="form-control" id="fileInput" accept=".xlsx" @change="handleFileChange"
                            multiple>
                    </div>
                    <button type="submit" class="btn btn-primary">Upload</button>
                </form>
            </div>
        </div>
    </div>
</template>
