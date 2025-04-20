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
            @click="setViewMode('day')"
            class="px-4 py-2 rounded-md font-medium transition-colors"
            :class="
              viewMode === 'day'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            "
          >
            День
          </button>
          <button
            @click="setViewMode('week')"
            class="px-4 py-2 rounded-md font-medium transition-colors"
            :class="
              viewMode === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            "
          >
            Неделя
          </button>
          <button
            @click="setViewMode('month')"
            class="px-4 py-2 rounded-md font-medium transition-colors"
            :class="
              viewMode === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            "
          >
            Месяц
          </button>
        </div>
        <div class="flex space-x-2">
          <button
            @click="showYandexIntegration = !showYandexIntegration"
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300 flex items-center"
          >
            <i class="fas fa-sync-alt mr-2"></i>
            Яндекс Календарь
          </button>
          <button
            @click="openAddEventModal"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            Новое событие
          </button>
          <button
            v-if="upcomingEvents.length > 0"
            @click="confirmClearAllEvents"
            class="bg-red-500 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <i class="fas fa-trash mr-2"></i>
            Очистить все
          </button>
        </div>
      </div>

      <!-- Интеграция с Яндекс Календарем (отображается по кнопке) -->
      <div v-if="showYandexIntegration" class="mb-6">
        <YandexCalendarIntegration @events-imported="handleImportedEvents" />
      </div>

      <!-- Календарь -->
      <div class="mb-8">
        <CalendarView
          :external-events="storeEvents"
          :view-mode="viewMode"
          :selected-date="selectedDate"
          @day-click="handleDayClick"
          @hour-click="handleHourClick"
          @event-click="handleEventClick"
          @date-change="handleDateChange"
        />
      </div>

      <!-- Предстоящие события -->
      <div class="mb-8" v-if="upcomingEvents.length > 0">
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
                    <p v-if="event.location" class="text-xs text-gray-500">
                      <i class="fas fa-map-marker-alt mr-1"></i>
                      {{ event.location }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="text-sm text-gray-600 font-medium">
                    <i class="fas fa-calendar-day mr-1"></i>
                    {{ formatDate(event.date) }}, {{ event.time }}
                  </div>
                  <button
                    class="ml-2 text-gray-400 hover:text-gray-500"
                    @click="handleEventEdit(event)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="ml-2 text-gray-400 hover:text-red-500"
                    @click.stop="confirmDeleteEvent(event)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <!-- Модальное окно для добавления/редактирования события -->
    <EventModal
      :is-open="isEventModalOpen"
      :event="selectedEvent"
      :selected-date="selectedDate"
      :selected-time="selectedTime"
      @close="closeEventModal"
      @submit="handleEventSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import CalendarView from "@/components/calendar/CalendarView.vue";
import YandexCalendarIntegration from "@/components/calendar/YandexCalendarIntegration.vue";
import EventModal from "@/components/calendar/EventModal.vue";
import type { Event } from "@/services";
import { useEventStore } from "@/stores";
import {
  format,
  addDays,
  isSameDay,
  isSameWeek,
  isSameMonth,
  startOfDay,
  isAfter,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";

const eventStore = useEventStore();
const showYandexIntegration = ref(false);
const importedEvents = ref<Event[]>([]);
const viewMode = ref<"day" | "week" | "month">("month");
const selectedDate = ref(new Date());
const isEventModalOpen = ref(false);
const selectedEvent = ref<Event | null>(null);
const selectedTime = ref("09:00");

// Загружаем события при монтировании компонента
onMounted(async () => {
  // Загружаем события
  if (eventStore.events.length === 0) {
    await eventStore.fetchEvents();
  }
});

// Получаем события из хранилища с учетом активного режима просмотра
const storeEvents = computed(() => {
  // Применяем фильтрацию в зависимости от текущего режима просмотра
  if (viewMode.value === "day") {
    return eventStore.events.filter((event) =>
      isSameDay(parseISO(event.date), selectedDate.value)
    );
  } else if (viewMode.value === "week") {
    const endDate = addDays(selectedDate.value, 6);
    return eventStore.eventsInRange(selectedDate.value, endDate);
  } else {
    // Для месяца используем встроенный геттер из хранилища
    const firstDayOfMonth = new Date(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth() + 1,
      0
    );
    return eventStore.eventsInRange(firstDayOfMonth, lastDayOfMonth);
  }
});

// Следим за изменениями режима отображения
watch([viewMode, selectedDate], () => {
  // При изменении режима отображения или даты обновляем список событий
  eventStore.fetchEvents();
});

// Только предстоящие события (начиная с сегодня и не более 5)
const upcomingEvents = computed(() => {
  const today = startOfDay(new Date());

  // Фильтруем события:
  // - только пользовательские (пропускаем тестовые/демо события)
  // - только начиная с сегодня
  return eventStore.events
    .filter((event: Event) => {
      const eventDate = parseISO(event.date);
      // Проверяем, что событие не является тестовым/системным
      const isUserAddedEvent =
        !event.externalId || !event.externalId.startsWith("demo-");
      return (
        (isAfter(eventDate, today) || isSameDay(eventDate, today)) &&
        isUserAddedEvent
      );
    })
    .sort((a: Event, b: Event) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Ограничиваем 5 ближайшими событиями
});

// Задаем режим отображения
const setViewMode = (mode: "day" | "week" | "month") => {
  viewMode.value = mode;
};

// Открытие модального окна для добавления события
const openAddEventModal = () => {
  selectedEvent.value = null;
  selectedTime.value = format(new Date(), "HH:mm");
  isEventModalOpen.value = true;
};

// Редактирование существующего события
const handleEventEdit = (event: Event) => {
  selectedEvent.value = { ...event };
  isEventModalOpen.value = true;
};

// Обработчик клика по дню в календаре
const handleDayClick = (date: Date) => {
  selectedDate.value = date;
  selectedEvent.value = null;
  selectedTime.value = "09:00"; // Устанавливаем значение по умолчанию
  isEventModalOpen.value = true;
};

// Обработчик клика по часу в календаре
const handleHourClick = (hour: number) => {
  const formattedHour = hour.toString().padStart(2, "0");
  selectedEvent.value = null;
  selectedTime.value = `${formattedHour}:00`;
  isEventModalOpen.value = true;
};

// Обработчик клика по событию в календаре
const handleEventClick = (eventData: any) => {
  // Проверяем, является ли событие полноценным объектом Event из нашего стора
  if (eventData.id) {
    // Если у события есть id, значит оно уже есть в сторе
    const event = eventStore.events.find((e) => e.id === eventData.id);
    if (event) {
      selectedEvent.value = { ...event };
      isEventModalOpen.value = true;
    }
  }
};

// Закрытие модального окна
const closeEventModal = () => {
  isEventModalOpen.value = false;
};

// Обработка добавления/редактирования события
const handleEventSubmit = async () => {
  // Обновляем список событий
  await eventStore.fetchEvents();
};

// Обработчик импортированных событий
const handleImportedEvents = (events: Event[]) => {
  importedEvents.value = events;
};

// Функция для форматирования даты в удобочитаемый формат
const formatDate = (dateValue: string | Date) => {
  try {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return format(date, "d MMMM", { locale: ru });
  } catch (e) {
    return typeof dateValue === "string"
      ? dateValue
      : format(dateValue, "yyyy-MM-dd");
  }
};

// Добавляем функцию подтверждения удаления события
const confirmDeleteEvent = (event: Event) => {
  if (confirm(`Вы уверены, что хотите удалить событие "${event.title}"?`)) {
    deleteEvent(event.id);
  }
};

// Функция удаления события
const deleteEvent = async (id: number) => {
  try {
    await eventStore.deleteEvent(id);
  } catch (error) {
    console.error("Ошибка при удалении события:", error);
  }
};

// Обработчик изменения даты в календаре
const handleDateChange = (date: Date) => {
  selectedDate.value = date;
};

// Добавляем функцию для очистки всех событий
const confirmClearAllEvents = () => {
  if (confirm("Вы уверены, что хотите удалить все события?")) {
    clearAllEvents();
  }
};

const clearAllEvents = async () => {
  try {
    // Удаляем все события
    for (const event of eventStore.events) {
      await eventStore.deleteEvent(event.id);
    }
  } catch (error) {
    console.error("Ошибка при удалении событий:", error);
  }
};
</script>
