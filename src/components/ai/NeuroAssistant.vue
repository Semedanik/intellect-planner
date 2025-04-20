<template>
  <div class="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
    <div class="flex items-center mb-4">
      <div
        class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3"
      >
        <i class="fas fa-robot text-indigo-600"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900">
        Рекомендации нейропомощника
      </h3>
    </div>

    <p class="text-gray-700 mb-4">
      Основываясь на вашем расписании и привычках, я рекомендую:
    </p>

    <div v-if="isLoading" class="flex items-center justify-center py-6">
      <i class="fas fa-spinner fa-spin text-indigo-500 mr-2"></i>
      <span class="text-gray-500">Анализирую ваши данные...</span>
    </div>

    <div v-else-if="recommendations.length === 0" class="text-center py-4">
      <p class="text-gray-500">
        Недостаточно данных для анализа. Добавьте задачи и события в расписание.
      </p>
    </div>

    <ul v-else class="space-y-3 mb-4">
      <li
        v-for="(recommendation, index) in recommendations"
        :key="index"
        class="flex items-start"
      >
        <div
          class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-0.5"
        >
          <i class="fas fa-check text-xs"></i>
        </div>
        <span class="text-gray-700">{{ recommendation }}</span>
      </li>
    </ul>

    <button
      v-if="recommendations.length > 0"
      @click="applyRecommendations"
      class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
    >
      Применить рекомендации
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useTaskStore } from "@/stores/tasks";
import { useEventStore } from "@/stores/events";
import { useScheduleStore } from "@/stores/schedule";
import { useAuthStore } from "@/stores/auth";
import { taskService } from "@/services";

const taskStore = useTaskStore();
const eventStore = useEventStore();
const scheduleStore = useScheduleStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const recommendations = ref<string[]>([]);

// Получаем данные пользователя при монтировании компонента
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await Promise.all([
      taskStore.fetchTasks(),
      eventStore.fetchEvents(),
      scheduleStore.fetchClasses(),
      scheduleStore.fetchSubjects(),
    ]);

    generateRecommendations();
    isLoading.value = false;
  } else {
    isLoading.value = false;
  }
});

// Функция для анализа задач и генерации рекомендаций
const generateRecommendations = () => {
  if (!authStore.isAuthenticated) {
    recommendations.value = [];
    return;
  }

  const tasks = taskStore.tasks;
  const events = eventStore.events;
  const classes = scheduleStore.classes;

  // Очищаем предыдущие рекомендации
  recommendations.value = [];

  // Проверяем просроченные задачи
  const overdueTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return !task.completed && dueDate < today;
  });

  if (overdueTasks.length > 0) {
    const task = overdueTasks[0];
    recommendations.value.push(
      `Заняться просроченной задачей "${task.title}" в первую очередь`
    );
  }

  // Проверяем ближайшие экзамены (по названию задачи)
  const examTasks = tasks.filter(
    (task) =>
      !task.completed &&
      (task.title.toLowerCase().includes("экзамен") ||
        task.description.toLowerCase().includes("экзамен"))
  );

  if (examTasks.length > 0) {
    const examTask = examTasks[0];
    const taskDateStr = examTask.dueDate;
    const taskDate = new Date(taskDateStr);
    const today = new Date();

    // Если экзамен близко (в течение следующих 5 дней)
    const daysUntilExam = Math.ceil(
      (taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilExam > 0 && daysUntilExam <= 5) {
      recommendations.value.push(
        `Выделить ${Math.min(daysUntilExam * 2, 3)} часа сегодня на подготовку к экзамену по ${examTask.category}`
      );
    }
  }

  // Проверяем большие проекты
  const bigProjects = tasks.filter(
    (task) =>
      !task.completed &&
      task.priority === "high" &&
      (task.title.toLowerCase().includes("проект") ||
        task.description.toLowerCase().includes("проект"))
  );

  if (bigProjects.length > 0) {
    recommendations.value.push(
      `Разбить проект по программированию на 3 части для более эффективной работы`
    );
  }

  // Оцениваем загруженность
  const upcomingTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const inOneWeek = new Date();
    inOneWeek.setDate(today.getDate() + 7);
    return !task.completed && dueDate >= today && dueDate <= inOneWeek;
  });

  const todaysEvents = events.filter((event) => {
    return event.date === new Date().toISOString().split("T")[0];
  });

  // Если у пользователя много задач, но мало событий - возможно, они перегружены работой
  if (upcomingTasks.length > 5 && todaysEvents.length < 2) {
    recommendations.value.push(
      `Перенести чтение литературы на выходные для лучшей концентрации`
    );
  }

  // Если рекомендаций меньше трех, добавим общие рекомендации
  if (recommendations.value.length < 3) {
    const generalRecommendations = [
      "Выделить 2 часа сегодня на подготовку к экзамену по математике",
      "Разбить проект по программированию на 3 части для более эффективной работы",
      "Перенести чтение литературы на выходные для лучшей концентрации",
      "Использовать технику Помодоро для повышения продуктивности",
      "Сделать перерыв в 15 минут после каждого часа работы",
      "Подготовить план на завтра перед сном",
    ];

    // Добавляем несколько общих рекомендаций, избегая дубликатов
    for (const rec of generalRecommendations) {
      if (
        !recommendations.value.includes(rec) &&
        recommendations.value.length < 3
      ) {
        recommendations.value.push(rec);
      }
    }
  }
};

// Функция для применения рекомендаций
const applyRecommendations = async () => {
  isLoading.value = true;

  try {
    // Здесь мы могли бы создать задачи на основе рекомендаций
    for (const recommendation of recommendations.value) {
      // Распознаем тип рекомендации и создаем соответствующую задачу
      if (recommendation.includes("подготовку к экзамену")) {
        const subject = recommendation.split("экзамену по ")[1];

        await taskStore.addTask({
          title: `Подготовка к экзамену по ${subject}`,
          description: `Задача создана на основе рекомендации нейропомощника: ${recommendation}`,
          dueDate: new Date().toISOString().split("T")[0],
          priority: "high",
          category: subject || "Учеба",
          progress: 0,
          completed: false,
        });
      } else if (recommendation.includes("Разбить проект")) {
        const taskParts = ["Исследование", "Разработка", "Тестирование"];

        for (let i = 0; i < taskParts.length; i++) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + i * 2); // Распределяем по времени

          await taskStore.addTask({
            title: `Часть ${i + 1}: ${taskParts[i]}`,
            description: `${i + 1}-я часть проекта по программированию. Создано на основе рекомендации нейропомощника.`,
            dueDate: dueDate.toISOString().split("T")[0],
            priority: "medium",
            category: "Программирование",
            progress: 0,
            completed: false,
          });
        }
      } else if (recommendation.includes("чтение литературы")) {
        const weekend = new Date();
        weekend.setDate(weekend.getDate() + (6 - weekend.getDay())); // Следующая суббота

        await taskStore.addTask({
          title: "Чтение литературы",
          description:
            "Выделить время для чтения литературы в спокойной обстановке. Создано на основе рекомендации нейропомощника.",
          dueDate: weekend.toISOString().split("T")[0],
          priority: "low",
          category: "Саморазвитие",
          progress: 0,
          completed: false,
        });
      }
    }

    // Генерируем новые рекомендации
    await taskStore.fetchTasks();
    generateRecommendations();
  } catch (error) {
    console.error("Ошибка при применении рекомендаций:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
