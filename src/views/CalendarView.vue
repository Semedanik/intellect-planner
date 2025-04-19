<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Шапка страницы -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Календарь</h1>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Фильтры и действия -->
      <div class="mb-6 flex justify-between items-center">
        <div class="flex space-x-2">
          <button
            class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium"
          >
            Сегодня
          </button>
          <button
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300"
          >
            День
          </button>
          <button
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300"
          >
            Неделя
          </button>
          <button
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300"
          >
            Месяц
          </button>
        </div>
        <div class="flex space-x-2">
          <button
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300 flex items-center"
          >
            <i class="fas fa-filter mr-2"></i>
            Фильтры
          </button>
          <button
            class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            Событие
          </button>
        </div>
      </div>

      <!-- Календарь -->
      <div class="mb-8">
        <CalendarView />
      </div>

      <!-- Предстоящие события -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Предстоящие события
        </h2>
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <ul class="divide-y divide-gray-200">
            <li
              v-for="event in upcomingEvents"
              :key="event.id"
              class="p-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="p-2 rounded-full" :class="event.colorClass">
                    <i :class="event.icon"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">
                      {{ event.title }}
                    </p>
                    <p class="text-sm text-gray-500">{{ event.type }}</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="text-sm text-gray-600 font-medium">
                    <i class="fas fa-calendar-day mr-1"></i>
                    {{ event.date }}
                  </div>
                  <button class="ml-4 text-gray-400 hover:text-gray-500">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CalendarView from "@/components/calendar/CalendarView.vue";

// Предстоящие события
const upcomingEvents = ref([
  {
    id: 1,
    title: "Экзамен по математике",
    type: "Экзамен",
    date: "21 апреля, 10:00",
    icon: "fas fa-book",
    colorClass: "bg-red-100 text-red-600",
  },
  {
    id: 2,
    title: "Встреча с научным руководителем",
    type: "Встреча",
    date: "23 апреля, 14:30",
    icon: "fas fa-user",
    colorClass: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    title: "Дедлайн проекта",
    type: "Дедлайн",
    date: "25 апреля, 23:59",
    icon: "fas fa-clock",
    colorClass: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 4,
    title: "Консультация перед экзаменом",
    type: "Учеба",
    date: "26 апреля, 12:00",
    icon: "fas fa-chalkboard-teacher",
    colorClass: "bg-green-100 text-green-600",
  },
]);
</script>
