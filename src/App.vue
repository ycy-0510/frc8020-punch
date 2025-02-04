<script setup>
import PageFooter from "./components/PageFooter.vue"
import 'bootstrap/dist/js/bootstrap.bundle'
import { onMounted, ref } from 'vue'
import router from "./router"
import Swal from "sweetalert2"

router.afterEach((to, from, failure) => {
  document.title = `${to.name} | FRC 8020 Punch`
})

</script>

<template>
  <main>
    <div class="fill-height">
      <router-view />
    </div>
  </main>
  <PageFooter />
</template>

<style scoped>
.fill-height {
  min-height: calc(100vh - 57px)
}
</style>
