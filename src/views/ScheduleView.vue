<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Шапка страницы -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Расписание</h1>
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
            Эта неделя
          </button>
          <button
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300"
          >
            Следующая неделя
          </button>
          <button
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300"
          >
            Весь семестр
          </button>
        </div>
        <div class="flex space-x-2">
          <button
            class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300 flex items-center"
          >
            <i class="fas fa-print mr-2"></i>
            Печать
          </button>
          <button
            class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            Добавить занятие
          </button>
        </div>
      </div>

      <!-- Расписание на неделю -->
      <div class="mb-8 overflow-hidden bg-white rounded-lg shadow">
        <div class="grid grid-cols-6 border-b">
          <div class="py-3 px-4 bg-gray-50 font-medium text-gray-500 text-sm">
            Время
          </div>
          <div
            v-for="day in weekDays"
            :key="day.abbr"
            class="py-3 px-4 text-center bg-gray-50 font-medium text-gray-900 text-sm"
          >
            {{ day.name }}
            <span class="text-xs text-gray-500 block">{{ day.date }}</span>
          </div>
        </div>

        <div class="divide-y divide-gray-200">
          <div
            v-for="timeSlot in timeSlots"
            :key="timeSlot.time"
            class="grid grid-cols-6"
          >
            <div class="py-3 px-4 font-medium text-gray-500 text-sm border-r">
              {{ timeSlot.time }}
            </div>
            <div
              v-for="(day, index) in weekDays"
              :key="`${timeSlot.time}-${day.abbr}`"
              class="p-2 relative min-h-[80px]"
              :class="{ 'border-r': index < weekDays.length - 1 }"
            >
              <div
                v-if="hasClass(timeSlot.time, day.abbr)"
                class="absolute inset-1 rounded-md p-2 text-xs"
                :class="getClassStyle(timeSlot.time, day.abbr)"
              >
                <div class="font-medium mb-1">
                  {{ getClass(timeSlot.time, day.abbr).subject }}
                </div>
                <div class="text-xs opacity-75">
                  {{ getClass(timeSlot.time, day.abbr).type }}
                </div>
                <div class="text-xs mt-1">
                  {{ getClass(timeSlot.time, day.abbr).location }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Легенда предметов -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Предметы</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="subject in subjects"
            :key="subject.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center"
          >
            <div
              class="w-4 h-4 rounded-full mr-3"
              :style="{ backgroundColor: subject.color }"
            ></div>
            <div>
              <p class="font-medium text-gray-900">{{ subject.name }}</p>
              <p class="text-sm text-gray-500">{{ subject.teacher }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// Дни недели
const weekDays = ref([
  { name: "Понедельник", abbr: "пн", date: "18 апр" },
  { name: "Вторник", abbr: "вт", date: "19 апр" },
  { name: "Среда", abbr: "ср", date: "20 апр" },
  { name: "Четверг", abbr: "чт", date: "21 апр" },
  { name: "Пятница", abbr: "пт", date: "22 апр" },
]);

// Временные слоты
const timeSlots = ref([
  { time: "09:00 - 10:30" },
  { time: "10:45 - 12:15" },
  { time: "12:30 - 14:00" },
  { time: "14:15 - 15:45" },
  { time: "16:00 - 17:30" },
]);

// Предметы
const subjects = ref([
  {
    id: 1,
    name: "Математический анализ",
    teacher: "Иванов И.И.",
    color: "#4f46e5",
  },
  { id: 2, name: "Физика", teacher: "Петров П.П.", color: "#0ea5e9" },
  {
    id: 3,
    name: "Программирование",
    teacher: "Сидоров С.С.",
    color: "#10b981",
  },
  { id: 4, name: "Литература", teacher: "Михайлова М.М.", color: "#f59e0b" },
  {
    id: 5,
    name: "Английский язык",
    teacher: "Андреева А.А.",
    color: "#ef4444",
  },
  { id: 6, name: "История", teacher: "Викторов В.В.", color: "#8b5cf6" },
]);

// Расписание занятий
const classes = ref([
  {
    time: "09:00 - 10:30",
    day: "пн",
    subject: "Математический анализ",
    type: "Лекция",
    location: "Ауд. 302",
    subjectId: 1,
  },
  {
    time: "10:45 - 12:15",
    day: "пн",
    subject: "Физика",
    type: "Лабораторная",
    location: "Ауд. 205",
    subjectId: 2,
  },
  {
    time: "12:30 - 14:00",
    day: "пн",
    subject: "Программирование",
    type: "Практика",
    location: "Ауд. 404",
    subjectId: 3,
  },
  {
    time: "09:00 - 10:30",
    day: "вт",
    subject: "Английский язык",
    type: "Практика",
    location: "Ауд. 201",
    subjectId: 5,
  },
  {
    time: "10:45 - 12:15",
    day: "вт",
    subject: "Литература",
    type: "Лекция",
    location: "Ауд. 301",
    subjectId: 4,
  },
  {
    time: "14:15 - 15:45",
    day: "вт",
    subject: "История",
    type: "Семинар",
    location: "Ауд. 208",
    subjectId: 6,
  },
  {
    time: "10:45 - 12:15",
    day: "ср",
    subject: "Математический анализ",
    type: "Практика",
    location: "Ауд. 302",
    subjectId: 1,
  },
  {
    time: "12:30 - 14:00",
    day: "ср",
    subject: "Физика",
    type: "Лекция",
    location: "Ауд. 205",
    subjectId: 2,
  },
  {
    time: "09:00 - 10:30",
    day: "чт",
    subject: "Программирование",
    type: "Лекция",
    location: "Ауд. 404",
    subjectId: 3,
  },
  {
    time: "12:30 - 14:00",
    day: "чт",
    subject: "Английский язык",
    type: "Практика",
    location: "Ауд. 201",
    subjectId: 5,
  },
  {
    time: "09:00 - 10:30",
    day: "пт",
    subject: "История",
    type: "Лекция",
    location: "Ауд. 208",
    subjectId: 6,
  },
  {
    time: "10:45 - 12:15",
    day: "пт",
    subject: "Литература",
    type: "Семинар",
    location: "Ауд. 301",
    subjectId: 4,
  },
]);

// Проверка наличия занятия
const hasClass = (time: string, day: string) => {
  return classes.value.some((cls) => cls.time === time && cls.day === day);
};

// Определим тип для класса
interface ClassItem {
  time?: string;
  day?: string;
  subject: string;
  type: string;
  location: string;
  subjectId?: number;
}

// Получение занятия
const getClass = (time: string, day: string): ClassItem => {
  return (
    classes.value.find((cls) => cls.time === time && cls.day === day) || {
      subject: "",
      type: "",
      location: "",
    }
  );
};

// Получение стиля для занятия
const getClassStyle = (time: string, day: string) => {
  const cls = getClass(time, day);
  if (!cls.subjectId) return "";

  const subject = subjects.value.find((s) => s.id === cls.subjectId);
  if (!subject) return "";

  return {
    "background-color": `${subject.color}20`, // 20% opacity
    border: `1px solid ${subject.color}`,
    color: `${subject.color}`,
  };
};
</script>
