import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSignature, } from '@fortawesome/free-solid-svg-icons'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import 'bootstrap/dist/css/bootstrap.min.css'

library.add(faSignature)
library.add(faSortUp)
library.add(faSortDown)


setTimeout(console.log.bind(console, '%c住手！', 'background-color:red;color: white;font-size:50px;border-radius: 10px;padding: 10px;'))
setTimeout(console.log.bind(console, '%c這是專門提供給開發人員的瀏覽器功能。如果有人告訴你在此處複製貼上某些內容可以使用某個功能或駭入網站，那其實是不實的詐騙訊息，並且會讓不法之徒有機會存取你的個人資料。', 'font-size:20px;padding: 10px;'))

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')
