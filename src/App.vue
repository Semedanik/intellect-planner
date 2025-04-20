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

const authStore = useAuthStore();

onMounted(() => {
  // Инициализируем авторизацию при запуске приложения
  authStore.initialize();
});
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  color: #2c3e50;
}
</style>
