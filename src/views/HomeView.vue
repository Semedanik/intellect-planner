<template>
  <div class="min-h-screen bg-white">
    <!-- Основной контент -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Верхняя секция с приветствием и статистикой -->
      <div class="mb-6">
        <div class="bg-indigo-600 rounded-lg overflow-hidden">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/2 p-8 flex flex-col justify-center">
              <h1 class="text-3xl font-bold text-white mb-4">Привет, Анна!</h1>
              <p class="text-indigo-100 mb-6">19 апреля 2025 г. | Суббота</p>
              <p class="text-white text-lg mb-6">
                У вас 12 активных задач, из которых 3 срочных.
              </p>
              <button
                class="bg-white text-indigo-600 px-6 py-2 rounded-md font-medium w-full md:w-auto"
              >
                Начать работу
              </button>
            </div>
            <div class="md:w-1/2 p-4 flex items-center justify-center">
              <img
                src="/hero.png"
                alt="Планирование задач"
                class="max-h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

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
              <p class="text-lg font-semibold text-gray-900">12</p>
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
              <p class="text-lg font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Выполнено сегодня</p>
              <p class="text-lg font-semibold text-gray-900">5</p>
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
              <p class="text-lg font-semibold text-gray-900">78%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- График продуктивности -->
      <div
        class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Продуктивность за неделю
        </h2>
        <div ref="productivityChart" class="h-64"></div>
      </div>

      <!-- Приоритетные задачи -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Приоритетные задачи
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Задача 1 -->
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div class="p-4">
              <div class="flex justify-between items-start mb-2">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >Высокий</span
                >
                <span class="text-sm text-gray-500">21 апреля</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">
                Подготовка к экзамену по математике
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Повторить темы: интегралы, дифференциальные уравнения
              </p>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <span
                    class="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
                  >
                    Математика
                  </span>
                </div>
                <div class="flex items-center">
                  <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="bg-indigo-600 h-2 rounded-full"
                      style="width: 45%"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-600">45%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Задача 2 -->
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div class="p-4">
              <div class="flex justify-between items-start mb-2">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >Средний</span
                >
                <span class="text-sm text-gray-500">23 апреля</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">
                Лабораторная работа по физике
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Завершить расчеты и оформить отчет
              </p>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <span
                    class="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
                  >
                    Физика
                  </span>
                </div>
                <div class="flex items-center">
                  <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="bg-indigo-600 h-2 rounded-full"
                      style="width: 70%"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-600">70%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Задача 3 -->
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div class="p-4">
              <div class="flex justify-between items-start mb-2">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >Средний</span
                >
                <span class="text-sm text-gray-500">25 апреля</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">
                Эссе по литературе
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Написать анализ произведения "Война и мир"
              </p>
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <span
                    class="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
                  >
                    Литература
                  </span>
                </div>
                <div class="flex items-center">
                  <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="bg-indigo-600 h-2 rounded-full"
                      style="width: 30%"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-600">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Предстоящие дедлайны -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Предстоящие дедлайны
        </h2>
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <ul class="divide-y divide-gray-200">
            <!-- Дедлайн 1 -->
            <li class="p-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="p-2 rounded-full bg-blue-100 text-blue-600">
                    <i class="fas fa-book"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">
                      Экзамен по математике
                    </p>
                    <p class="text-sm text-gray-500">Математика</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="text-sm text-red-600 font-medium">
                    <i class="fas fa-calendar-day mr-1"></i>
                    2 дн.
                  </div>
                  <button class="ml-4 text-gray-400 hover:text-gray-500">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </li>

            <!-- Дедлайн 2 -->
            <li class="p-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="p-2 rounded-full bg-green-100 text-green-600">
                    <i class="fas fa-book"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">
                      Проект по программированию
                    </p>
                    <p class="text-sm text-gray-500">Программирование</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="text-sm text-yellow-600">
                    <i class="fas fa-calendar-day mr-1"></i>
                    3 дн.
                  </div>
                  <button class="ml-4 text-gray-400 hover:text-gray-500">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </li>

            <!-- Дедлайн 3 -->
            <li class="p-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="p-2 rounded-full bg-purple-100 text-purple-600">
                    <i class="fas fa-book"></i>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">
                      Лабораторная работа по физике
                    </p>
                    <p class="text-sm text-gray-500">Физика</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="text-sm text-yellow-600">
                    <i class="fas fa-calendar-day mr-1"></i>
                    4 дн.
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

      <!-- Рекомендации нейропомощника -->
      <div
        class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-6 mb-8"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0 p-3 bg-indigo-100 rounded-full">
            <i class="fas fa-robot text-indigo-600"></i>
          </div>
          <div class="ml-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">
              Рекомендации нейропомощника
            </h2>
            <p class="text-gray-700 mb-4">
              Основываясь на вашем расписании и привычках, я рекомендую:
            </p>
            <ul class="space-y-2 mb-4">
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                <span class="text-gray-700"
                  >Выделить 2 часа сегодня на подготовку к экзамену по
                  математике</span
                >
              </li>
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                <span class="text-gray-700"
                  >Разбить проект по программированию на 3 части для более
                  эффективной работы</span
                >
              </li>
              <li class="flex items-start">
                <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                <span class="text-gray-700"
                  >Перенести чтение литературы на выходные для лучшей
                  концентрации</span
                >
              </li>
            </ul>
            <button class="text-indigo-600 font-medium hover:text-indigo-700">
              Применить рекомендации
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Плавающая кнопка помощника -->
    <div class="fixed bottom-6 right-6">
      <button
        class="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700"
      >
        <i class="fas fa-robot"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";

// График продуктивности
const productivityChart = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

onMounted(() => {
  if (productivityChart.value) {
    chart = echarts.init(productivityChart.value);

    const option = {
      animation: false,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: "value",
        max: 100,
      },
      series: [
        {
          name: "Продуктивность",
          type: "bar",
          barWidth: "60%",
          data: [65, 72, 83, 76, 68, 78, 0],
          itemStyle: {
            color: function (params: any) {
              const colorList = [
                "#818cf8",
                "#818cf8",
                "#818cf8",
                "#818cf8",
                "#818cf8",
                "#818cf8",
                "#e5e7eb",
              ];
              return colorList[params.dataIndex];
            },
          },
        },
      ],
    };

    chart.setOption(option);

    window.addEventListener("resize", () => {
      chart?.resize();
    });
  }
});
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
