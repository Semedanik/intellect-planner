<template>
  <div id="app" class="min-h-screen w-full bg-gray-50 font-sans">
    <MainNavigation />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import MainNavigation from "./components/ui/MainNavigation.vue";
import { useAuthStore } from "./stores/auth";
import { useTaskStore } from "./stores/tasks";

const authStore = useAuthStore();
const taskStore = useTaskStore();

onMounted(() => {
  // Инициализируем авторизацию при запуске приложения
  authStore.initialize();

  // Проверяем, нужно ли очистить статичные данные при первом запуске
  const hasCleanedStorage = localStorage.getItem("intellect_planner_cleaned");
  if (!hasCleanedStorage) {
    // Очищаем задачи
    taskStore.clearAllTasks();
    // Устанавливаем флаг, что очистка была выполнена
    localStorage.setItem("intellect_planner_cleaned", "true");
  }
});
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  color: #2c3e50;
}
</style>
