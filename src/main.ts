import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import "./styles/main.css";

// Создаем экземпляр приложения
const app = createApp(App);

// Инициализируем Pinia для управления состоянием
const pinia = createPinia();
app.use(pinia);

// Подключаем роутер
app.use(router);

// Запускаем приложение
app.mount("#app");
