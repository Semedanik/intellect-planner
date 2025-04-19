<template>
  <div id="app" class="min-h-screen w-full bg-gray-50 font-sans">
    <MainNavigation />
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainNavigation from "./components/ui/MainNavigation.vue";

export default defineComponent({
  name: "App",
  components: {
    MainNavigation,
  },
});
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  color: #2c3e50;
}
</style>
