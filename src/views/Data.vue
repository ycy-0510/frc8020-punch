<script setup>
import { ref, reactive } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

const punchData = ref({})
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

});

const hashWithSHA256 = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

const exportAll = async () => {
    const data = {
        header: 'FRC8020PunchData',
        punchData: punchData.value,
        realName: realName
    }
    //hash with sha256
    const hash = await hashWithSHA256(JSON.stringify(data))
    data.hash = hash
    const json = JSON.stringify(data)
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FRC8020PunchData.cpd';
    a.click();
}

const importAll = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cpd';
    input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = JSON.parse(e.target.result);
            console.log(data);
            if (data.header === 'FRC8020PunchData') {
                const fileHash = data.hash
                delete data.hash
                const hash = await hashWithSHA256(JSON.stringify(data))
                if (hash === fileHash) {
                    Swal.fire({
                        title: 'Are you sure?',
                        text: "Do you want to recover the data?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, recover it!'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const newpunchData = data.punchData
                            const newrealName = data.realName
                            localStorage.setItem('data', JSON.stringify(newpunchData))
                            localStorage.setItem('realName', JSON.stringify(newrealName))
                            Swal.fire({
                                icon: 'success',
                                title: 'Imported',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                location.reload();
                            })
                        }
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid File(2)',
                        text: `File is not valid${hash} ${fileHash}`,
                    })
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File(1)',
                    text: 'File is not valid',
                })
            }
        }
        reader.readAsText(file);
    }
    input.click();
}

</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>Data Manage</h2>
                <div class="row py-4">
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h4>Export Data</h4>
                                <p>Export data to backup.</p>
                                <button class="btn btn-primary w-100" @click="exportAll">Export All</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h4>Import Data</h4>
                                <p>Import data from recover data.</p>
                                <button class="btn btn-danger w-100" @click="importAll">Import All</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
