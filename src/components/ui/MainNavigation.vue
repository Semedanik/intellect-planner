<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <svg
              class="h-8 w-8 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              ></path>
            </svg>
            <span class="ml-2 text-xl font-semibold text-gray-800"
              >ПланМастер</span
            >
          </div>
          <div class="ml-6 flex space-x-8">
            <router-link
              to="/"
              class="text-gray-500 hover:text-gray-700 inline-flex items-center px-4 pt-1 text-sm font-medium"
              :class="{
                'text-gray-900 border-b-2 border-indigo-500': isActive('/'),
              }"
            >
              Главная
            </router-link>
            <router-link
              to="/tasks"
              class="text-gray-500 hover:text-gray-700 inline-flex items-center px-4 pt-1 text-sm font-medium"
              :class="{
                'text-gray-900 border-b-2 border-indigo-500':
                  isActive('/tasks'),
              }"
            >
              Задачи
            </router-link>
            <router-link
              to="/calendar"
              class="text-gray-500 hover:text-gray-700 inline-flex items-center px-4 pt-1 text-sm font-medium"
              :class="{
                'text-gray-900 border-b-2 border-indigo-500':
                  isActive('/calendar'),
              }"
            >
              Календарь
            </router-link>
            <router-link
              to="/schedule"
              class="text-gray-500 hover:text-gray-700 inline-flex items-center px-4 pt-1 text-sm font-medium"
              :class="{
                'text-gray-900 border-b-2 border-indigo-500':
                  isActive('/schedule'),
              }"
            >
              Расписание
            </router-link>
          </div>
        </div>
        <div class="flex items-center">
          <button class="p-1 rounded-full text-gray-500 relative">
            <span class="sr-only">Уведомления</span>
            <i class="fas fa-bell"></i>
            <span
              class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            ></span>
          </button>
          <div class="ml-3">
            <button class="flex items-center">
              <div
                class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"
              >
                <i class="fas fa-user"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isActive = (path: string) => {
  return route.path === path;
};
</script>
