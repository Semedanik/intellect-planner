<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-4 bg-indigo-600 text-white flex justify-between items-center">
      <button class="hover:bg-indigo-700 p-2 rounded-full">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h2 class="font-semibold text-lg">
        {{ currentMonthName }} {{ currentYear }}
      </h2>
      <button class="hover:bg-indigo-700 p-2 rounded-full">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    <div class="grid grid-cols-7 gap-px bg-gray-200">
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
          'p-2 bg-white min-h-[100px] hover:bg-gray-50',
          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
          day.isToday ? 'bg-indigo-50 font-semibold' : '',
        ]"
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
                event.type === 'task'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-green-100 text-green-800',
              ]"
            >
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface CalendarEvent {
  id: number;
  title: string;
  type: "task" | "event";
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const currentMonthName = computed(() => {
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
  return months[currentMonth.value];
});

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Генерация календарных дней
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

  // Мок-события
  const mockEvents: { [key: string]: CalendarEvent[] } = {
    "2025-04-20": [
      { id: 1, title: "Подготовка к экзамену", type: "task" },
      { id: 2, title: "Встреча с научным руководителем", type: "event" },
    ],
    "2025-04-21": [
      { id: 3, title: "Сдача промежуточного отчета", type: "task" },
    ],
    "2025-04-25": [{ id: 4, title: "Консультация", type: "event" }],
  };

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

    days.push({
      date: currentDate,
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday:
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear(),
      events: mockEvents[dateKey] || [],
    });
  }

  return days;
});
</script>
