<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-4 bg-indigo-600 text-white flex justify-between items-center">
      <button
        class="hover:bg-indigo-700 p-2 rounded-full"
        @click="navigatePrev"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <h2 class="font-semibold text-lg">
        {{ headerTitle }}
      </h2>
      <button
        class="hover:bg-indigo-700 p-2 rounded-full"
        @click="navigateNext"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Вид по месяцам -->
    <div
      v-if="viewMode === 'month'"
      class="grid grid-cols-7 gap-px bg-gray-200"
    >
      <div
        v-for="day in weekDays"
        :key="day"
        class="p-2 text-center text-sm font-medium bg-gray-100 text-gray-700"
      >
        {{ day }}
      </div>

      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'p-2 bg-white min-h-[100px] hover:bg-gray-50 cursor-pointer',
          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
          day.isToday ? 'bg-indigo-50 font-semibold' : '',
        ]"
        @click="$emit('day-click', day.date)"
      >
        <div class="flex flex-col h-full">
          <span class="text-sm">{{ day.dayNumber }}</span>
          <div
            v-if="day.events.length > 0"
            class="mt-1 flex flex-col space-y-1"
          >
            <div
              v-for="event in day.events"
              :key="event.id"
              :class="[
                'px-2 py-1 text-xs rounded-md font-medium truncate',
                getEventClass(event),
              ]"
              :title="event.title"
              @click.stop="$emit('event-click', event)"
            >
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Вид по неделям -->
    <div
      v-else-if="viewMode === 'week'"
      class="grid grid-cols-7 gap-px bg-gray-200"
    >
      <div
        v-for="day in weekDays"
        :key="day"
        class="p-2 text-center text-sm font-medium bg-gray-100 text-gray-700"
      >
        {{ day }}
      </div>

      <div
        v-for="(day, index) in weekView"
        :key="index"
        :class="[
          'p-2 bg-white min-h-[300px] hover:bg-gray-50 cursor-pointer',
          day.isToday ? 'bg-indigo-50 font-semibold' : '',
        ]"
        @click="$emit('day-click', day.date)"
      >
        <div class="flex flex-col h-full">
          <span class="text-sm font-medium mb-2">
            {{ formatDayMonth(day.date) }}
          </span>
          <div class="overflow-y-auto h-full">
            <div
              v-for="event in day.events"
              :key="event.id"
              :class="[
                'mb-2 px-2 py-1 text-xs rounded-md font-medium',
                getEventClass(event),
              ]"
              :title="event.title"
              @click.stop="$emit('event-click', event)"
            >
              <div class="flex justify-between items-center">
                <span>{{ event.time }}</span>
              </div>
              <div>{{ event.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Вид по дням -->
    <div v-else-if="viewMode === 'day'" class="min-h-[600px]">
      <div class="px-4 py-2 border-b border-gray-200 bg-gray-100">
        <h3 class="text-sm font-medium text-gray-700">
          {{ formatFullDate(selectedDate) }}
        </h3>
      </div>
      <div class="grid grid-cols-1 divide-y divide-gray-200">
        <div
          v-for="hour in hours"
          :key="hour"
          class="p-2 min-h-[60px] hover:bg-gray-50 cursor-pointer"
          @click="$emit('hour-click', hour)"
        >
          <div class="flex">
            <div class="w-16 text-xs text-gray-500">{{ formatHour(hour) }}</div>
            <div class="flex-1">
              <div
                v-for="event in getEventsForHour(hour)"
                :key="event.id"
                :class="[
                  'px-2 py-1 text-xs rounded-md font-medium mb-1',
                  event.colorClass || getEventClass(event),
                ]"
                @click.stop="$emit('event-click', event)"
              >
                <div class="flex items-center">
                  <i v-if="event.icon" :class="event.icon + ' mr-1'"></i>
                  <span>{{ event.title }}</span>
                </div>
                <div
                  v-if="event.description"
                  class="text-xs text-gray-600 mt-1"
                >
                  {{ event.description.slice(0, 50)
                  }}{{ event.description.length > 50 ? "..." : "" }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  subDays,
  startOfWeek,
  addWeeks,
  subWeeks,
  parseISO,
  isValid,
  addHours,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Event } from "@/services";

// Определяем события, которые компонент может генерировать
const emit = defineEmits<{
  (e: "day-click", date: Date): void;
  (e: "hour-click", hour: number): void;
  (e: "event-click", event: CalendarEvent): void;
  (e: "date-change", date: Date): void;
}>();

// Принимаем внешние события через props
const props = defineProps({
  externalEvents: {
    type: Array as () => Event[],
    default: () => [],
  },
  viewMode: {
    type: String as () => "day" | "week" | "month",
    default: "month",
  },
  selectedDate: {
    type: Date,
    default: () => new Date(),
  },
});

interface CalendarEvent {
  id: number;
  title: string;
  type: string;
  time?: string;
  externalId?: string;
  colorClass?: string;
  icon?: string;
  description?: string;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const currentDate = ref(new Date());

watch(
  () => props.selectedDate,
  (newVal) => {
    currentDate.value = new Date(newVal);
  },
  { immediate: true }
);

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const headerTitle = computed(() => {
  if (props.viewMode === "day") {
    return formatFullDate(currentDate.value);
  } else if (props.viewMode === "week") {
    const startOfCurrentWeek = startOfWeek(currentDate.value, {
      weekStartsOn: 1,
    });
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);
    return `${format(startOfCurrentWeek, "d MMMM", { locale: ru })} - ${format(endOfCurrentWeek, "d MMMM yyyy", { locale: ru })}`;
  } else {
    const months = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];
    return `${months[currentMonth.value]} ${currentYear.value}`;
  }
});

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const hours = Array.from({ length: 24 }, (_, i) => i);

// Функция для навигации вперед зависит от режима отображения
const navigateNext = () => {
  if (props.viewMode === "day") {
    currentDate.value = addDays(currentDate.value, 1);
  } else if (props.viewMode === "week") {
    currentDate.value = addWeeks(currentDate.value, 1);
  } else {
    currentDate.value = addMonths(currentDate.value, 1);
  }
};

// Функция для навигации назад зависит от режима отображения
const navigatePrev = () => {
  if (props.viewMode === "day") {
    currentDate.value = subDays(currentDate.value, 1);
  } else if (props.viewMode === "week") {
    currentDate.value = subWeeks(currentDate.value, 1);
  } else {
    currentDate.value = subMonths(currentDate.value, 1);
  }
};

// Определяем класс для события в зависимости от его типа
const getEventClass = (event: CalendarEvent): string => {
  if (event.type === "task") {
    return "bg-indigo-100 text-indigo-800";
  } else if (event.type === "Яндекс Календарь") {
    return "bg-yellow-100 text-yellow-800";
  } else {
    return "bg-green-100 text-green-800";
  }
};

// Метод для преобразования всех внешних событий в формат календаря
const getExternalCalendarEvents = (): Record<string, CalendarEvent[]> => {
  const result: Record<string, CalendarEvent[]> = {};

  props.externalEvents.forEach((event) => {
    // Проверяем, не является ли событие тестовым/демо
    if (event.externalId && event.externalId.startsWith("demo-")) {
      return; // Пропускаем демо-события
    }

    const dateKey = event.date;

    if (!result[dateKey]) {
      result[dateKey] = [];
    }

    result[dateKey].push({
      id: event.id,
      title: event.title,
      type: event.type,
      time: event.time,
      externalId: event.externalId,
      colorClass: event.colorClass,
      icon: event.icon,
      description: event.description,
    });
  });

  return result;
};

// Форматирование даты в формате "день месяц"
const formatDayMonth = (date: Date): string => {
  return format(date, "d MMM", { locale: ru });
};

// Форматирование даты в полном формате
const formatFullDate = (date: Date): string => {
  return format(date, "d MMMM yyyy", { locale: ru });
};

// Форматирование часа
const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

// Получение событий для конкретного часа
const getEventsForHour = (hour: number) => {
  const today = format(currentDate.value, "yyyy-MM-dd");
  const events = props.externalEvents.filter((event) => {
    if (event.date !== today) return false;

    // Если время отсутствует, но это задача, отобразим её в 9:00
    if (
      !event.time &&
      (event.type === "task" ||
        (event.externalId && event.externalId.startsWith("task-")))
    ) {
      return hour === 9; // По умолчанию отображаем такие задачи в 9:00
    }

    // Извлекаем час из времени события
    try {
      const [eventHour] = (event.time || "00:00").split(":").map(Number);
      return eventHour === hour;
    } catch (e) {
      console.error("Ошибка при разборе времени события:", e);
      return false;
    }
  });

  return events;
};

// Представление по неделям
const weekView = computed(() => {
  const startOfCurrentWeek = startOfWeek(currentDate.value, {
    weekStartsOn: 1,
  });
  const days = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfCurrentWeek, i);
    const dateKey = format(day, "yyyy-MM-dd");
    const today = new Date();

    days.push({
      date: day,
      dayNumber: day.getDate(),
      isToday:
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear(),
      events: props.externalEvents.filter((event) => {
        // Проверяем, совпадает ли дата события с текущим днем
        return event.date === dateKey;
      }),
    });
  }

  return days;
});

// Генерация календарных дней с учетом внешних событий
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  // Первый день месяца
  const firstDay = new Date(year, month, 1);
  // Последний день месяца
  const lastDay = new Date(year, month + 1, 0);

  // Корректировка для начала с понедельника
  let dayOfWeek = firstDay.getDay() || 7;
  dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

  // Количество дней для отображения из предыдущего месяца
  const daysFromPrevMonth = dayOfWeek - 1;

  // Начальная дата для календаря
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - daysFromPrevMonth);

  // Генерация 42 дней (6 недель)
  const days: CalendarDay[] = [];
  const today = new Date();

  // Получаем события из props
  const externalEvents = getExternalCalendarEvents();

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateKey = format(currentDate, "yyyy-MM-dd");

    days.push({
      date: currentDate,
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday:
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear(),
      events: externalEvents[dateKey] || [],
    });
  }

  return days;
});

// Выводим в консоль обновление после изменения даты
watch(
  () => currentDate.value,
  (newDate) => {
    // Эмитим событие обновления даты в родительский компонент
    emit("date-change", newDate);
  }
);

// Следим за изменениями внешних событий и режима отображения
watch(
  () => [props.externalEvents, props.viewMode],
  () => {
    // При изменении внешних событий или режима отображения
    // computed свойства будут пересчитаны автоматически
  },
  { deep: true }
);
</script>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
