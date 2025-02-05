<script setup>
import Swal from "sweetalert2";
import { onMounted, ref } from "vue"

</script>
<template>
    <nav class="navbar sticky-top navbar-expand-lg bg-white border-bottom d-print-none">
        <div class="container-fluid">
            <a class="navbar-brand">
                FRC8020 Punch
            </a>
            <div class="mx-auto"></div>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavDropdown">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <RouterLink to="/" class="nav-link" active-class="active">Upload</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/view" class="nav-link" active-class="active">View</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/edit-name" class="nav-link" active-class="active">Edit Name</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/edit" class="nav-link" active-class="active">Edit</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/data" class="nav-link" active-class="active">Data</RouterLink>
                    </li>
                    <li class="nav-item">
                        <a href="https://github.com/ycy-0510/frc8020-punch" class="nav-link" target="_blank">Open Source</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.logo {
    height: 35px;
}

.btn-rounded {
    border-radius: 100%;
    width: 40px;
    height: 40px;
}
</style>