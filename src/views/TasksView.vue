<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Шапка страницы -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Мои задачи</h1>
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

      <!-- Статистика -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Активные задачи</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ taskStats.active }}
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
                {{ taskStats.urgent }}
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
              <p class="text-sm font-medium text-gray-500">Выполнено сегодня</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ taskStats.completed }}
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

      <!-- Список задач -->
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        Приоритетные задачи
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :title="task.title"
          :description="task.description"
          :due-date="task.dueDate"
          :priority="task.priority"
          :subject="task.subject"
          :progress="task.progress"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TaskCard from "@/components/tasks/TaskCard.vue";
import { useTaskStore } from "@/stores/tasks";

const taskStore = useTaskStore();

const taskStats = ref({
  active: taskStore.activeTasks,
  urgent: taskStore.urgentTasks,
  completed: taskStore.completedToday,
  productivity: taskStore.productivity,
});

const tasks = ref(taskStore.priorityTasks);
</script>
