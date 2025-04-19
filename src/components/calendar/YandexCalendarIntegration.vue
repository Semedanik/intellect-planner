<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Интеграция с Яндекс Календарем
      </h3>
      <p class="text-sm text-gray-600">
        Импортируйте события из вашего Яндекс Календаря и синхронизируйте их с
        ПланМастером.
      </p>
    </div>

    <div v-if="!store.isConfigured" class="mb-4">
      <div class="mb-4">
        <label
          for="clientId"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          ID приложения
        </label>
        <input
          id="clientId"
          v-model="clientId"
          type="text"
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Введите ID приложения Яндекс"
        />
      </div>
      <div class="mb-4">
        <label
          for="calendarId"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          ID календаря
        </label>
        <input
          id="calendarId"
          v-model="calendarId"
          type="text"
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Введите ID календаря (primary для основного)"
        />
        <p class="text-xs text-gray-500 mt-1">
          Для основного календаря используйте "primary"
        </p>
      </div>
      <div class="mb-4">
        <button
          @click="authorize"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          :disabled="!clientId || !calendarId"
        >
          Авторизоваться в Яндекс
        </button>
      </div>
    </div>

    <div v-else class="mb-4">
      <div class="flex items-center justify-between mb-4">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          <svg
            class="mr-1.5 h-2 w-2 text-green-400"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx="4" cy="4" r="3" />
          </svg>
          Подключено
        </span>
        <button
          @click="disconnectCalendar"
          class="text-sm text-red-600 hover:text-red-800"
        >
          Отключить
        </button>
      </div>

      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-sm font-medium text-gray-700">
            Диапазон синхронизации
          </h4>
        </div>
        <div class="flex space-x-2">
          <input
            id="startDate"
            v-model="startDate"
            type="date"
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            id="endDate"
            v-model="endDate"
            type="date"
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div class="flex space-x-2">
        <button
          @click="syncEvents"
          class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          :disabled="store.isLoading"
        >
          <span v-if="store.isLoading">
            <i class="fas fa-spinner fa-spin mr-2"></i> Загрузка...
          </span>
          <span v-else>Синхронизировать события</span>
        </button>
      </div>
    </div>

    <div v-if="store.hasEvents" class="mt-6">
      <h4 class="text-sm font-medium text-gray-700 mb-2">
        Импортированные события
      </h4>
      <ul class="divide-y divide-gray-200">
        <li v-for="event in store.upcomingEvents" :key="event.id" class="py-3">
          <div class="flex items-start">
            <div class="p-2 rounded-full bg-yellow-100 text-yellow-600">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
              <p class="text-xs text-gray-500">
                {{ event.date }}, {{ event.time }}
              </p>
              <p v-if="event.location" class="text-xs text-gray-500">
                <i class="fas fa-map-marker-alt mr-1"></i> {{ event.location }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="store.error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { format, addDays } from "date-fns";
import { useYandexCalendarStore } from "@/stores";
import { Event, yandexCalendarService } from "@/services";

// Используем хранилище Pinia
const store = useYandexCalendarStore();

// Локальное состояние
const clientId = ref("");
const calendarId = ref("primary");
const accessToken = ref("");

// Даты для синхронизации (по умолчанию - текущий месяц)
const startDate = ref(format(new Date(), "yyyy-MM-dd"));
const endDate = ref(format(addDays(new Date(), 30), "yyyy-MM-dd"));

// Определяем emit для передачи событий родительскому компоненту
const emit = defineEmits<{
  (e: "events-imported", events: Event[]): void;
}>();

// Инициализация
onMounted(() => {
  // Проверяем, есть ли сохраненная конфигурация
  store.loadConfig();

  // Проверяем, есть ли токен в URL (при возврате от OAuth)
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get("access_token");
    if (token) {
      accessToken.value = token;

      // Если есть ID календаря, сохраняем конфигурацию
      if (calendarId.value) {
        store.setupIntegration(accessToken.value, calendarId.value);
        // Очищаем URL от токена
        window.location.hash = "";
      }
    }
  }
});

// Авторизация в Яндекс
const authorize = () => {
  if (!clientId.value) {
    store.error = "Необходимо указать ID приложения";
    return;
  }

  // Получаем URL авторизации и перенаправляем пользователя
  const redirectUri = window.location.origin + window.location.pathname;
  const authUrl = yandexCalendarService.getAuthUrl(clientId.value, redirectUri);
  window.location.href = authUrl;
};

// Синхронизация событий
const syncEvents = async () => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  const events = await store.syncEvents(start, end);

  // Передаем события родительскому компоненту
  emit("events-imported", events);
};

// Отключение интеграции
const disconnectCalendar = () => {
  store.disconnectIntegration();
  // Сообщаем родительскому компоненту, что событий больше нет
  emit("events-imported", []);
};
</script>
