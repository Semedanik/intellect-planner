<template>
  <div class="min-h-screen bg-white">
    <!-- Основной контент -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Верхняя секция с приветствием и статистикой -->
      <div class="mb-6">
        <div class="bg-indigo-600 rounded-lg overflow-hidden">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/2 p-8 flex flex-col justify-center">
              <!-- Разное приветствие для авторизованных и неавторизованных пользователей -->
              <h1
                class="text-3xl font-bold text-white mb-4"
                v-if="authStore.isAuthenticated"
              >
                Привет, {{ authStore.user?.name.split(" ")[0] }}!
              </h1>
              <h1 class="text-3xl font-bold text-white mb-4" v-else>
                Добро пожаловать в интеллектуальный планировщик учебных задач!
              </h1>

              <p class="text-indigo-100 mb-6">{{ currentDate }}</p>

              <!-- Разное сообщение о задачах в зависимости от авторизации -->
              <p
                class="text-white text-lg mb-6"
                v-if="authStore.isAuthenticated"
              >
                У вас {{ taskStats.activeTasks }} активных задач, из которых
                {{ taskStats.urgentTasks }} срочных.
              </p>
              <p class="text-white text-lg mb-6" v-else>
                Войдите или зарегистрируйтесь, чтобы начать эффективно
                распределять свое время!
              </p>

              <!-- Разные кнопки действия -->
              <button
                class="bg-white text-indigo-600 px-6 py-2 rounded-md font-medium w-full md:w-auto"
                v-if="authStore.isAuthenticated"
                @click="$router.push('/tasks')"
              >
                Перейти к задачам
              </button>
              <button
                class="bg-white text-indigo-600 px-6 py-2 rounded-md font-medium w-full md:w-auto"
                v-else
                @click="openAuthModal"
              >
                Начать пользоваться
              </button>
            </div>
            <div class="md:w-1/2 p-4 flex items-center justify-center">
              <img
                src="@/assets/hero.png"
                alt="Планирование задач"
                class="max-h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Содержимое только для авторизованных пользователей -->
      <div v-if="authStore.isAuthenticated">
        <!-- Фильтры и действия -->
        <div class="mb-6 flex justify-between items-center">
          <div class="flex space-x-2">
            <button
              class="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md font-medium"
            >
              Сегодня
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
              <i class="fas fa-sort-amount-down mr-2"></i>
              Сортировка
            </button>
            <button
              class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium flex items-center"
              @click="$router.push('/tasks')"
            >
              <i class="fas fa-plus mr-2"></i>
              Новая задача
            </button>
          </div>
        </div>

        <!-- Статистика и аналитика -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Активные задачи</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ taskStats.activeTasks }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-red-100 text-red-600">
                <i class="fas fa-clock"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Срочные</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ taskStats.urgentTasks }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">
                  Выполнено сегодня
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ taskStats.completedToday }}
                </p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Продуктивность</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ taskStats.productivity }}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- График продуктивности -->
        <div
          class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8"
        >
          <div ref="productivityChart" class="h-80"></div>
        </div>

        <!-- Приоритетные задачи -->
        <div class="mb-8" v-if="priorityTasks.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Приоритетные задачи
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Задача (повторяющийся блок) -->
            <div
              v-for="task in priorityTasks"
              :key="task.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <span
                    :class="{
                      'bg-red-100 text-red-800': task.priority === 'high',
                      'bg-yellow-100 text-yellow-800':
                        task.priority === 'medium',
                      'bg-green-100 text-green-800': task.priority === 'low',
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    >{{ getPriorityText(task.priority) }}</span
                  >
                  <span class="text-sm text-gray-500">{{
                    formatDate(task.dueDate)
                  }}</span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">
                  {{ task.title }}
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  {{ task.description }}
                </p>
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <span
                      class="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
                    >
                      {{ task.category }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-indigo-600 h-2 rounded-full"
                        :style="{ width: `${task.progress}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-600"
                      >{{ task.progress }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Рекомендации нейропомощника -->
        <div class="mb-8">
          <NeuroRecommendations />
        </div>
      </div>

      <!-- Раздел для неавторизованных пользователей -->
      <div v-else class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Преимущество 1 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div
              class="p-3 rounded-full bg-indigo-100 text-indigo-600 w-12 h-12 flex items-center justify-center mb-4"
            >
              <i class="fas fa-tasks"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Управление задачами
            </h3>
            <p class="text-gray-600">
              Создавайте, отслеживайте и приоритизируйте учебные задачи.
              Группируйте их по предметам и устанавливайте дедлайны.
            </p>
          </div>

          <!-- Преимущество 2 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div
              class="p-3 rounded-full bg-purple-100 text-purple-600 w-12 h-12 flex items-center justify-center mb-4"
            >
              <i class="fas fa-chart-line"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Отслеживание прогресса
            </h3>
            <p class="text-gray-600">
              Наблюдайте за своей продуктивностью с течением времени.
              Визуализируйте свои достижения и прогресс в выполнении задач.
            </p>
          </div>

          <!-- Преимущество 3 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div
              class="p-3 rounded-full bg-green-100 text-green-600 w-12 h-12 flex items-center justify-center mb-4"
            >
              <i class="fas fa-calendar-alt"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Планирование времени
            </h3>
            <p class="text-gray-600">
              Используйте календарь для планирования своего учебного времени.
              Интеграция с популярными календарями.
            </p>
          </div>
        </div>

        <!-- Рекомендации нейропомощника для неавторизованных пользователей -->
        <div class="mt-8 mb-8">
          <NeuroRecommendations />
        </div>

        <div class="flex justify-center mt-10">
          <button
            @click="openAuthModal"
            class="bg-indigo-600 text-white px-8 py-3 rounded-md font-medium text-lg hover:bg-indigo-700 transition-colors"
          >
            Создать аккаунт
          </button>
        </div>
      </div>
    </main>
  </div>

  <!-- Модальное окно авторизации -->
  <AuthModal
    :is-open="isAuthModalOpen"
    @close="closeAuthModal"
    @auth-success="handleAuthSuccess"
  />

  <!-- Кнопка и чат нейропомощника -->
  <NeuroChat />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/tasks";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import * as echarts from "echarts";
import AuthModal from "@/components/ui/AuthModal.vue";
import NeuroRecommendations from "@/components/ai/NeuroRecommendations.vue";
import NeuroChat from "@/components/ai/NeuroChat.vue";

const router = useRouter();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const productivityChart = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
const isAuthModalOpen = ref(false);

// Текущая дата в формате "19 апреля 2025 г. | Суббота"
const currentDate = computed(() => {
  const now = new Date();
  return `${format(now, "d MMMM yyyy г.", { locale: ru })} | ${format(now, "EEEE", { locale: ru }).charAt(0).toUpperCase() + format(now, "EEEE", { locale: ru }).slice(1)}`;
});

// Получение данных задач
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await taskStore.fetchTasks();
    await taskStore.fetchStats();
    initChart();
  }
});

// Статистика задач
const taskStats = computed(() => {
  if (taskStore.stats) {
    return taskStore.stats;
  }
  return {
    activeTasks: 0,
    urgentTasks: 0,
    completedToday: 0,
    productivity: 0,
    productivityData: [] as Array<{ date: string; value: number }>,
  };
});

// Приоритетные задачи (первые 3 неоконченные задачи с высоким или средним приоритетом)
const priorityTasks = computed(() => {
  return taskStore.tasks
    .filter(
      (task) =>
        !task.completed &&
        (task.priority === "high" || task.priority === "medium")
    )
    .sort((a, b) => {
      // Сначала задачи с высоким приоритетом, затем по сроку
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 3);
});

// Инициализация графика продуктивности
const initChart = () => {
  if (!productivityChart.value) return;

  // Если диаграмма уже инициализирована, очищаем ее
  if (chart) {
    chart.dispose();
  }

  // Создаем новый экземпляр диаграммы
  chart = echarts.init(productivityChart.value);

  // Данные продуктивности за последние 7 дней
  let productivityData: number[] = [];

  if (
    taskStore.stats?.productivityData &&
    taskStore.stats.productivityData.length > 0
  ) {
    // Преобразуем данные из формата {date, value} в массив значений
    productivityData = taskStore.stats.productivityData.map(
      (item) => item.value
    );
  } else {
    // Генерируем моковые данные, если настоящие недоступны
    productivityData = generateMockProductivityData();
  }

  // Генерируем метки дней недели для последних 7 дней
  const daysLabels = Array(7)
    .fill(null)
    .map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + index);
      return format(date, "EEE", { locale: ru });
    })
    .map((day) => day.charAt(0).toUpperCase() + day.slice(1));

  // Опции диаграммы
  const option = {
    title: {
      text: "Продуктивность за неделю",
      left: "left",
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: "normal",
        color: "#1f2937",
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: "{b}: {c}%",
      backgroundColor: "rgba(255,255,255,0.9)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        color: "#374151",
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "5%",
      top: 60,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: daysLabels,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#6b7280",
        fontSize: 12,
        margin: 15,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "#f3f4f6",
          width: 1,
          type: "solid",
        },
      },
      axisLabel: {
        formatter: "{value}%",
        color: "#6b7280",
        fontSize: 12,
        margin: 15,
      },
    },
    series: [
      {
        name: "Продуктивность",
        type: "bar",
        data: productivityData,
        barWidth: "50%",
        itemStyle: {
          color: "#818cf8",
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#6366f1",
          },
        },
        label: {
          show: false,
        },
      },
    ],
  };

  // Применяем настройки к диаграмме
  chart.setOption(option);

  // Адаптируем размер диаграммы при изменении размера окна
  window.addEventListener("resize", () => {
    chart?.resize();
  });
};

// Функция для генерации реалистичных моковых данных продуктивности
const generateMockProductivityData = (): number[] => {
  // Генерируем данные в диапазоне 60-85% с некоторой вариативностью
  return Array(7)
    .fill(0)
    .map(() => {
      const baseValue = 60 + Math.floor(Math.random() * 25); // Базовое значение между 60% и 85%
      const variation = Math.floor(Math.random() * 10) - 5; // Случайное отклонение +/- 5%
      return Math.max(0, Math.min(100, baseValue + variation)); // Ограничиваем значения диапазоном 0-100%
    });
};

// Метод для получения текстового представления приоритета
const getPriorityText = (priority: string): string => {
  switch (priority) {
    case "high":
      return "Высокий";
    case "medium":
      return "Средний";
    case "low":
      return "Низкий";
    default:
      return "Обычный";
  }
};

// Метод для форматирования даты
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "d MMMM", { locale: ru });
  } catch (error) {
    return dateString;
  }
};

// Очистка при размонтировании компонента
onUnmounted(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  window.removeEventListener("resize", () => {
    chart?.resize();
  });
});

// Управление модальным окном авторизации
const openAuthModal = () => {
  isAuthModalOpen.value = true;
};

const closeAuthModal = () => {
  isAuthModalOpen.value = false;
};

const handleAuthSuccess = async () => {
  closeAuthModal();
  // Загружаем данные задач после успешной авторизации
  if (authStore.isAuthenticated) {
    await taskStore.fetchTasks();
    await taskStore.fetchStats();
    initChart();
  }
};
</script>

<style scoped>
/* Дополнительные стили */
.task-card {
  transition: transform 0.2s ease-in-out;
}

.task-card:hover {
  transform: translateY(-4px);
}
</style>
