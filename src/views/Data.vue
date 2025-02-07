<script setup>
import { ref, reactive } from 'vue';
import PageHeader from "../components/PageHeader.vue"
import { onMounted } from 'vue'
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import router from '../router';


const userNameReplace = ref({})
const punchData = ref({})
const realName = reactive({})
const localQuota = ref(0)
const localUsage = ref(0)
const users = reactive([])
const dropboxLink = ref('')

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

onMounted(async () => {
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

    const localDataU = localStorage.getItem('userNameReplace')
    if (localDataU) {
        userNameReplace.value = JSON.parse(localDataU)
    }

    //set usernames
    for (const [key, value] of Object.entries(realName)) {
        users.push(key)
    }
    //sort by realName
    users.sort((a, b) => {
        return realName[a].localeCompare(realName[b])
    })

    //get local storage usage
    const localDataSize = new Blob([JSON.stringify(punchData.value)]).size + new Blob([JSON.stringify(realName)]).size + new Blob([JSON.stringify(localQuota.value)]).size + new Blob([JSON.stringify(userNameReplace.value)]).size
    localQuota.value = 5 * 1024 * 1024
    localUsage.value = localDataSize
    console.log(localDataSize)

    let urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.has('import'));
    if (urlParams.has('import')) {
        Swal.fire({
            title: 'Import Data',
            text: "Do you want to import data from the link?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, import it!'
        }).then((result) => {
            if (result.isConfirmed) {
                //get data from link
                const partoflink = urlParams.get('import')
                const link = '/.functions/dropbox-proxy?file=' + encodeURIComponent(partoflink);
                Swal.fire({
                    title: 'Importing Data',
                    text: 'Please wait...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                });

                fetch(link).then(response => response.json()).then(data => {
                    console.log(data)
                    const newpunchData = data.punchData
                    const newrealName = data.realName
                    const newuserNameReplace = data.userNameReplace
                    localStorage.setItem('data', JSON.stringify(newpunchData))
                    localStorage.setItem('realName', JSON.stringify(newrealName))
                    if (newuserNameReplace) {
                        localStorage.setItem('userNameReplace', JSON.stringify(newuserNameReplace))
                    }
                    Swal.fire({
                        icon: 'success',
                        title: 'Imported',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        location.replace('/dashboard')
                    })
                }).catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to import data',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    console.error('Error fetching data:', error);
                    router.replace('/dashboard')
                });

            } else {
                router.replace('/view')
            }
        })
    }
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
        realName: realName,
        userNameReplace: userNameReplace.value
    }
    //hash with sha256
    const hash = await hashWithSHA256(JSON.stringify(data))
    data.hash = hash
    const json = JSON.stringify(data)
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const datetime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace(/[-:]/g, '');
    const a = document.createElement('a');
    a.href = url;
    a.download = `FRC8020PunchData-${datetime}.cpd`;
    a.click();
}

const importAll = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cpd,.cpd.json';
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
                            const newuserNameReplace = data.userNameReplace
                            localStorage.setItem('data', JSON.stringify(newpunchData))
                            localStorage.setItem('realName', JSON.stringify(newrealName))
                            if (newuserNameReplace) {
                                localStorage.setItem('userNameReplace', JSON.stringify(newuserNameReplace))
                            }
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

const exportPunch = () => {
    const data = [];

    for (const user of users) {
        const dates = punchData.value[user];
        for (const [date, times] of Object.entries(dates)) {
            data.push({
                User: realName[user] || user,
                Date: date,
                In: times.in,
                Out: times.out,
                'I=': times.inedited ? '=' : '',
                'O=': times.outedited ? '=' : ''
            });
        }
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PunchData');
    const datetime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace(/[-:]/g, '');
    XLSX.writeFile(workbook, `PunchIn-all-${datetime}.xlsx`);
};

const shareWithLink = () => {
    const link = dropboxLink.value
    if (link && link.includes('dropbox.com') && link.endsWith('&dl=0') && link.includes('scl/fi/') && link.includes('.cpd')) {
        const sharedLinkP = link.replace('https://www.dropbox.com/scl/fi/', '').replace('&dl=0', '').replace('?', '//q').replace('&', '//a');
        const shareUrl = window.location.origin + '/data?import=' + sharedLinkP
        console.log(shareUrl)
        navigator.clipboard.writeText(shareUrl).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Link Copied',
                showConfirmButton: false,
                timer: 2500
            });
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Link',
            text: 'Please provide a valid Dropbox link',
            showConfirmButton: false,
            timer: 1500
        });
    }
}

const deletAllData = () => {
    //ask user first by using sweetalert and enter 'DELETE ALL DATA' to confirm
    Swal.fire({
        title: 'Are you sure?',
        text: "To confirm, type 'DELETE ALL DATA'",
        input: 'text',
        inputPlaceholder: 'DELETE ALL DATA',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        preConfirm: (inputValue) => {
            if (inputValue !== 'DELETE ALL DATA') {
                Swal.showValidationMessage('You need to type "DELETE ALL DATA"');
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            //delete all data
            localStorage.removeItem('data')
            localStorage.removeItem('realName')
            localStorage.removeItem('userNameReplace')
            Swal.fire({
                icon: 'success',
                title: 'Deleted',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload();
            })
        }
    })
}
</script>

<template>
    <PageHeader />
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9 pt-4">
                <h2>Data Manage</h2>
                <div class="row py-4">
                    <div class="col-12 col-md-6 pb-2">
                        <div class="card h-100">
                            <div class="card-body">
                                <h4>Export Data</h4>
                                <p>Export data to backup.</p>
                                <button class="btn btn-primary w-100" @click="exportAll">Export All</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 pb-2">
                        <div class="card h-100">
                            <div class="card-body">
                                <h4>Import Data</h4>
                                <p>Import data from recover data.</p>
                                <button class="btn btn-danger w-100" @click="importAll">Import All</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 pb-2">
                        <div class="card h-100">
                            <div class="card-body">
                                <h4>Local Data Usage</h4>
                                <p> Local Data usage of the browser.</p>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar"
                                        :style="{ width: `${localUsage / localQuota * 100}%` }" aria-valuenow="25"
                                        aria-valuemin="0" aria-valuemax="100">
                                    </div>
                                </div>
                                <p>{{ (localUsage / 1024 / 1024).toFixed(2) }}MB / {{ localQuota / 1024 / 1024 }}MB</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 pb-2">
                        <div class="card h-100">
                            <div class="card-body">
                                <h4>How to share data with link</h4>
                                <p>Upload to Dropbox and paste the link here.</p>
                                <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Dropbox Link"
                                        v-model="dropboxLink">
                                    <button class="btn btn-primary" @click="shareWithLink">Share</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 pb-2">
                        <div class="card h-100">
                            <div class="card-body">
                                <h4>Export All Punch Data</h4>
                                <p>Export all punch data share</p>
                                <button class="btn btn-primary w-100" @click="exportPunch">Export</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 pb-2">
                        <div class="card h-100">
                            <div class="card-body">
                                <h4>Delete All Data</h4>
                                <p>Delete all data from local storage</p>
                                <button class="btn btn-danger w-100" @click="deletAllData">Delete All Data</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
