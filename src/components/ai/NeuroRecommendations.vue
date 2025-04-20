<template>
  <div class="bg-white p-6 rounded-lg shadow-sm border border-indigo-100">
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

    <div
      v-else-if="!recommendations.length && authStore.isAuthenticated"
      class="text-center py-4"
    >
      <p class="text-gray-500">
        Недостаточно данных для анализа. Добавьте задачи и события в расписание.
      </p>
    </div>

    <div v-else-if="!authStore.isAuthenticated" class="text-center py-4">
      <p class="text-gray-500">
        Войдите в аккаунт, чтобы получить персональные рекомендации
      </p>
    </div>

    <ul v-else class="space-y-3 mb-4">
      <li
        v-for="(recommendation, index) in recommendations"
        :key="recommendation.id"
        class="flex items-start"
      >
        <div
          class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-0.5"
        >
          <i class="fas fa-check text-xs"></i>
        </div>
        <span class="text-gray-700">{{ recommendation.text }}</span>
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
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/tasks";
import { useEventStore } from "@/stores/events";
import { aiService, type AiRecommendation } from "@/services";

const authStore = useAuthStore();
const taskStore = useTaskStore();
const eventStore = useEventStore();
const isLoading = ref(true);
const recommendations = ref<AiRecommendation[]>([]);

// Получение рекомендаций при монтировании
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user?.id) {
    try {
      await Promise.all([taskStore.fetchTasks(), eventStore.fetchEvents()]);

      // Загружаем существующие рекомендации
      const existingRecommendations = await aiService.getRecommendations(
        authStore.user.id
      );

      // Если рекомендаций нет или их мало, генерируем новые
      if (existingRecommendations.length < 3) {
        // Генерируем новые рекомендации
        recommendations.value = await aiService.generateRecommendations(
          authStore.user.id,
          taskStore.tasks,
          eventStore.events
        );
      } else {
        recommendations.value = existingRecommendations;
      }
    } catch (error) {
      console.error("Ошибка при загрузке рекомендаций:", error);

      // Если произошла ошибка, показываем стандартные рекомендации
      generateDefaultRecommendations();
    }
  } else {
    // Для неавторизованных пользователей показываем стандартные рекомендации
    generateDefaultRecommendations();
  }

  isLoading.value = false;
});

// Функция для генерации стандартных рекомендаций
const generateDefaultRecommendations = () => {
  const defaultRecommendations = [
    {
      id: 1,
      userId: 0,
      text: "Выделить 2 часа сегодня на подготовку к экзамену по математике",
      type: "study" as const,
      createdAt: new Date().toISOString(),
      applied: false,
    },
    {
      id: 2,
      userId: 0,
      text: "Разбить проект по программированию на 3 части для более эффективной работы",
      type: "productivity" as const,
      createdAt: new Date().toISOString(),
      applied: false,
    },
    {
      id: 3,
      userId: 0,
      text: "Перенести чтение литературы на выходные для лучшей концентрации",
      type: "schedule" as const,
      createdAt: new Date().toISOString(),
      applied: false,
    },
  ];

  recommendations.value = defaultRecommendations;
};

// Функция для применения рекомендаций
const applyRecommendations = async () => {
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    openAuthModal();
    return;
  }

  isLoading.value = true;

  try {
    // Применяем каждую рекомендацию
    for (const recommendation of recommendations.value) {
      // Помечаем рекомендацию как примененную
      await aiService.markRecommendationApplied(recommendation.id);

      // Создаем задачу на основе рекомендации
      if (recommendation.text.includes("подготовку к экзамену")) {
        const subject = recommendation.relatedSubject || "предмету";
        await taskStore.addTask({
          title: `Подготовка к экзамену по ${subject}`,
          description: `Создано на основе рекомендации: ${recommendation.text}`,
          dueDate: new Date().toISOString().split("T")[0],
          priority: "high",
          category: subject,
          progress: 0,
          completed: false,
        });
      } else if (
        recommendation.text.includes("Разбить проект") ||
        recommendation.text.includes("разбить")
      ) {
        await taskStore.addTask({
          title: "Разбить проект на части",
          description: `Создано на основе рекомендации: ${recommendation.text}`,
          dueDate: new Date().toISOString().split("T")[0],
          priority: "medium",
          category: "Программирование",
          progress: 0,
          completed: false,
        });
      } else if (recommendation.text.includes("чтение литературы")) {
        const weekend = new Date();
        weekend.setDate(weekend.getDate() + (6 - weekend.getDay())); // Следующая суббота

        await taskStore.addTask({
          title: "Чтение литературы",
          description: `Создано на основе рекомендации: ${recommendation.text}`,
          dueDate: weekend.toISOString().split("T")[0],
          priority: "low",
          category: "Саморазвитие",
          progress: 0,
          completed: false,
        });
      }
    }

    // Обновляем список задач и генерируем новые рекомендации
    await taskStore.fetchTasks();
    if (authStore.user?.id) {
      recommendations.value = await aiService.generateRecommendations(
        authStore.user.id,
        taskStore.tasks,
        eventStore.events
      );
    }
  } catch (error) {
    console.error("Ошибка при применении рекомендаций:", error);
  } finally {
    isLoading.value = false;
  }
};

// Открытие модального окна авторизации
const openAuthModal = () => {
  // Здесь должна быть логика открытия модального окна авторизации
  // Можно использовать систему событий или store для этого
  console.log("Требуется авторизация для применения рекомендаций");
};
</script>
