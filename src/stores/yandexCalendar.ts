import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { yandexCalendarService, Event } from "@/services";

export const useYandexCalendarStore = defineStore("yandexCalendar", () => {
  // Состояние
  const events = ref<Event[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isConfigured = ref(false);

  // Действия
  // Загрузка конфигурации при инициализации
  const loadConfig = () => {
    const config = yandexCalendarService.loadConfig();
    isConfigured.value = config !== null;
    return config;
  };

  // Синхронизация событий
  const syncEvents = async (startDate: Date, endDate: Date) => {
    if (!isConfigured.value) {
      error.value =
        "Необходимо сначала настроить интеграцию с Яндекс Календарем";
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      events.value = await yandexCalendarService.syncEvents(startDate, endDate);
      return events.value;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Произошла ошибка при синхронизации событий";
      }
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Настройка интеграции
  const setupIntegration = (accessToken: string, calendarId: string) => {
    try {
      yandexCalendarService.setConfig({
        accessToken,
        calendarId,
      });
      isConfigured.value = true;
      error.value = null;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Произошла ошибка при настройке интеграции";
      }
    }
  };

  // Отключение интеграции
  const disconnectIntegration = () => {
    yandexCalendarService.clearConfig();
    isConfigured.value = false;
    events.value = [];
  };

  // Геттеры
  const hasEvents = computed(() => events.value.length > 0);

  const upcomingEvents = computed(() => {
    return [...events.value].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Инициализация
  loadConfig();

  return {
    // Состояние
    events,
    isLoading,
    error,
    isConfigured,

    // Действия
    loadConfig,
    syncEvents,
    setupIntegration,
    disconnectIntegration,

    // Геттеры
    hasEvents,
    upcomingEvents,
  };
});
