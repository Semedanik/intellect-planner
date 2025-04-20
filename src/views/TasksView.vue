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
            class="px-4 py-2 rounded-md font-medium transition-colors duration-200"
            @click="filterTasks('today')"
            :class="{
              'bg-indigo-600 text-white': activeFilter === 'today',
              'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50':
                activeFilter !== 'today',
            }"
          >
            Сегодня
          </button>
          <button
            class="px-4 py-2 rounded-md font-medium transition-colors duration-200"
            @click="filterTasks('week')"
            :class="{
              'bg-indigo-600 text-white': activeFilter === 'week',
              'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50':
                activeFilter !== 'week',
            }"
          >
            Неделя
          </button>
          <button
            class="px-4 py-2 rounded-md font-medium transition-colors duration-200"
            @click="filterTasks('month')"
            :class="{
              'bg-indigo-600 text-white': activeFilter === 'month',
              'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50':
                activeFilter !== 'month',
            }"
          >
            Месяц
          </button>
        </div>
        <div class="flex space-x-2">
          <div class="relative">
            <button
              @click="toggleSortMenu"
              class="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300 flex items-center hover:bg-gray-50 transition-colors duration-200 sort-button"
            >
              <i class="fas fa-sort-amount-down mr-2"></i>
              Сортировка: {{ getSortLabel() }}
            </button>
            <div
              v-if="showSortMenu"
              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div class="py-1" role="menu" aria-orientation="vertical">
                <button
                  @click="sortTasks('priority')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                  :class="{ 'bg-gray-100': sortBy === 'priority' }"
                >
                  По приоритету
                </button>
                <button
                  @click="sortTasks('dueDate')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                  :class="{ 'bg-gray-100': sortBy === 'dueDate' }"
                >
                  По сроку
                </button>
                <button
                  @click="sortTasks('category')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                  :class="{ 'bg-gray-100': sortBy === 'category' }"
                >
                  По категории
                </button>
                <button
                  @click="sortTasks('progress')"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                  :class="{ 'bg-gray-100': sortBy === 'progress' }"
                >
                  По прогрессу
                </button>
              </div>
            </div>
          </div>
          <button
            @click="clearAllTasks"
            class="bg-red-600 text-white px-4 py-2 rounded-md font-medium flex items-center hover:bg-red-700 transition-colors duration-200"
          >
            <i class="fas fa-trash-alt mr-2"></i>
            Очистить задачи
          </button>
          <button
            @click="openAddTaskModal"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium flex items-center hover:bg-indigo-700 transition-colors duration-200"
          >
            <i class="fas fa-plus mr-2"></i>
            Новая задача
          </button>
        </div>
      </div>

      <div v-if="taskStore.isLoading" class="flex justify-center my-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        ></div>
      </div>

      <div v-else-if="taskStore.error" class="bg-red-100 p-4 rounded-md my-4">
        <p class="text-red-700">{{ taskStore.error }}</p>
      </div>

      <template v-else>
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
                <p class="text-sm font-medium text-gray-500">
                  {{ getCompletedLabel() }}
                </p>
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
                <p class="text-sm font-medium text-gray-500">
                  Продуктивность
                  <span class="text-xs text-gray-400"
                    >({{ getTimeFrameLabel() }})</span
                  >
                </p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ taskStats.productivity }}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Список задач -->
        <div v-if="filteredTasks.length > 0">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ getFilterTitle() }}
            </h2>
            <div class="text-sm text-gray-500">
              Показано: {{ filteredTasks.length }} из
              {{ totalActiveTasks }} задач
            </div>
          </div>
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            <TaskCard
              v-for="task in filteredTasks"
              :key="task.id"
              :id="task.id"
              :title="task.title"
              :description="task.description"
              :due-date="task.dueDate"
              :priority="task.priority"
              :category="task.category"
              :progress="task.progress"
              :completed="task.completed"
              @click="openEditTaskModal(task)"
              @complete="completeTask(task.id)"
              @delete="deleteTask(task.id)"
              class="cursor-pointer"
            />
          </div>
        </div>
        <div v-else class="text-center my-12">
          <div class="text-gray-400 mb-4">
            <i class="fas fa-clipboard-list text-5xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-600">
            Нет активных задач{{
              activeFilter !== "all" ? " в выбранном периоде" : ""
            }}
          </h3>
          <p class="text-gray-500 mt-2">{{ getEmptyStateMessage() }}</p>
          <button
            @click="openAddTaskModal"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors duration-200"
          >
            <i class="fas fa-plus mr-2"></i>
            Новая задача
          </button>
        </div>
      </template>
    </main>

    <!-- Модальное окно для добавления/редактирования задачи -->
    <TaskModal
      :is-open="isTaskModalOpen"
      :task="selectedTask"
      @close="closeTaskModal"
      @submit="handleTaskSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted as onUnmount } from "vue";
import TaskCard from "@/components/tasks/TaskCard.vue";
import TaskModal from "@/components/tasks/TaskModal.vue";
import { useTaskStore } from "@/stores/tasks";
import type { Task } from "@/services/taskService";
import { checkApiConnection } from "@/services/api";
import { useEventStore } from "@/stores/events";

const taskStore = useTaskStore();
const activeFilter = ref("month"); // Фильтр по умолчанию - месяц
const sortBy = ref("priority");
const showSortMenu = ref(false);
const isTaskModalOpen = ref(false);
const selectedTask = ref<Task | null>(null);
const isOfflineMode = ref(false);

// Проверка подключения к API
const checkConnectionStatus = async () => {
  isOfflineMode.value = !(await checkApiConnection());
};

// Загрузка задач при монтировании компонента
onMounted(async () => {
  await checkConnectionStatus();

  if (taskStore.tasks.length === 0) {
    await taskStore.fetchTasks();
  }
  if (!taskStore.stats) {
    await taskStore.fetchStats();
  }

  // Добавляем обработчик клика для закрытия меню сортировки
  document.addEventListener("click", closeDropdowns);
});

// Удаляем обработчик при размонтировании компонента
onUnmount(() => {
  document.removeEventListener("click", closeDropdowns);
});

// Периодическая проверка подключения
const connectionChecker = setInterval(checkConnectionStatus, 30000); // проверка каждые 30 секунд
onUnmount(() => clearInterval(connectionChecker));

// Общее количество активных задач (не завершенных)
const totalActiveTasks = computed(
  () => taskStore.tasks.filter((task) => !task.completed).length
);

// Статистика по задачам в зависимости от фильтра
const taskStats = computed(() => {
  // Получаем все задачи, которые могли бы быть в текущем фильтре по времени
  const filteredByTime = getTasksFilteredByTime();

  const active = filteredByTime.filter((task) => !task.completed).length;
  const urgent = filteredByTime.filter(
    (task) => !task.completed && task.priority === "high"
  ).length;
  const completed = filteredByTime.filter((task) => task.completed).length;

  // Рассчитываем продуктивность (выполненные задачи / общее количество задач * 100)
  const productivity =
    filteredByTime.length > 0
      ? Math.round((completed / filteredByTime.length) * 100)
      : 0;

  return { active, urgent, completed, productivity };
});

// Получаем задачи, отфильтрованные только по времени (без учета статуса выполнения)
const getTasksFilteredByTime = () => {
  const tasks = taskStore.tasks;

  if (activeFilter.value === "today") {
    const todayString = today.toISOString().split("T")[0];
    return tasks.filter((task) => task.dueDate === todayString);
  } else if (activeFilter.value === "week") {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate <= nextWeek;
    });
  } else if (activeFilter.value === "month") {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate <= nextMonth;
    });
  }

  return tasks; // Если фильтр не установлен, возвращаем все задачи
};

// Фильтрация задач
const filterTasks = (filter: string) => {
  activeFilter.value = filter;
};

// Текущая дата
const today = new Date();
today.setHours(0, 0, 0, 0);

// Дата через неделю
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

// Дата через месяц
const nextMonth = new Date(today);
nextMonth.setMonth(nextMonth.getMonth() + 1);

// Функция для определения веса приоритета
const priorityWeight = (priority: string): number => {
  switch (priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
};

// Функция для сортировки задач
const sortTasksList = (tasksToSort: Task[], sortField: string): Task[] => {
  return [...tasksToSort].sort((a, b) => {
    if (sortField === "priority") {
      return priorityWeight(b.priority) - priorityWeight(a.priority);
    } else if (sortField === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortField === "category") {
      return a.category.localeCompare(b.category);
    } else if (sortField === "progress") {
      return b.progress - a.progress;
    }
    return 0;
  });
};

// Отфильтрованные и отсортированные задачи
const filteredTasks = computed<Task[]>(() => {
  let tasks = taskStore.tasks.filter((task) => !task.completed);

  // Применяем фильтр по времени
  if (activeFilter.value === "today") {
    const todayString = formatDate(today);
    console.log("Сегодняшняя дата:", todayString);
    tasks = tasks.filter((task) => {
      console.log(`Сравниваем: ${task.dueDate} === ${todayString}`);
      return task.dueDate === todayString;
    });
  } else if (activeFilter.value === "week") {
    tasks = tasks.filter((task) => {
      const taskDate = parseDate(task.dueDate);
      return taskDate >= today && taskDate <= nextWeek;
    });
  } else if (activeFilter.value === "month") {
    tasks = tasks.filter((task) => {
      const taskDate = parseDate(task.dueDate);
      return taskDate >= today && taskDate <= nextMonth;
    });
  }

  // Применяем сортировку
  return sortTasksList(tasks, sortBy.value);
});

// Функция для форматирования даты в строку YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Функция для преобразования строки даты в объект Date
const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Сортировка задач и обновление интерфейса
const sortTasks = (sortField: string): Task[] => {
  sortBy.value = sortField;
  showSortMenu.value = false;
  return sortTasksList(filteredTasks.value, sortField);
};

// Получение метки для текущего типа сортировки
const getSortLabel = (): string => {
  switch (sortBy.value) {
    case "priority":
      return "Приоритет";
    case "dueDate":
      return "Срок";
    case "category":
      return "Категория";
    case "progress":
      return "Прогресс";
    default:
      return "Приоритет";
  }
};

// Получение метки для выполненных задач
const getCompletedLabel = (): string => {
  switch (activeFilter.value) {
    case "today":
      return "Выполнено сегодня";
    case "week":
      return "Выполнено за неделю";
    case "month":
      return "Выполнено за месяц";
    default:
      return "Выполнено всего";
  }
};

// Получение метки для временного промежутка в статистике продуктивности
const getTimeFrameLabel = (): string => {
  switch (activeFilter.value) {
    case "today":
      return "сегодня";
    case "week":
      return "за неделю";
    case "month":
      return "за месяц";
    default:
      return "за все время";
  }
};

// Переключение меню сортировки
const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value;
};

// Получение заголовка для текущего фильтра
const getFilterTitle = (): string => {
  switch (activeFilter.value) {
    case "today":
      return "Задачи на сегодня";
    case "week":
      return "Задачи на неделю";
    case "month":
      return "Задачи на месяц";
    default:
      return "Все задачи";
  }
};

// Получение сообщения для пустого списка задач
const getEmptyStateMessage = (): string => {
  switch (activeFilter.value) {
    case "today":
      return `Добавьте новую задачу на сегодня или проверьте задачи на другие даты`;
    case "week":
      return `Добавьте новую задачу на этой неделе или измените фильтр`;
    case "month":
      return `Добавьте новую задачу на этот месяц`;
    default:
      return `Добавьте новую задачу, чтобы начать`;
  }
};

// Открытие модального окна для добавления задачи
const openAddTaskModal = () => {
  selectedTask.value = null;
  isTaskModalOpen.value = true;
};

// Открытие модального окна для редактирования задачи
const openEditTaskModal = (task: Task) => {
  selectedTask.value = task;
  isTaskModalOpen.value = true;
};

// Закрытие модального окна
const closeTaskModal = () => {
  isTaskModalOpen.value = false;
};

// Обработка отправки формы задачи
const handleTaskSubmit = async () => {
  // Обновляем список задач после добавления/редактирования
  await taskStore.fetchTasks();
  await taskStore.fetchStats();

  // Обновляем список событий в календаре
  const eventStore = useEventStore();
  await eventStore.fetchEvents();
};

// Закрытие меню сортировки при клике вне его
const closeDropdowns = (e: MouseEvent) => {
  if (showSortMenu.value) {
    const target = e.target as HTMLElement;
    if (!target.closest(".sort-button")) {
      showSortMenu.value = false;
    }
  }
};

// Обработка выполнения задачи
const completeTask = async (taskId: number) => {
  try {
    await taskStore.updateTask(taskId, { completed: true });
    // Обновляем список задач после отметки как выполненного
    await taskStore.fetchTasks();
    await taskStore.fetchStats();
  } catch (error) {
    console.error("Ошибка при выполнении задачи:", error);
  }
};

// Обработка удаления задачи
const deleteTask = async (taskId: number) => {
  if (confirm("Вы действительно хотите удалить эту задачу?")) {
    try {
      await taskStore.deleteTask(taskId);
      // Обновляем список задач после удаления
      await taskStore.fetchStats();
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  }
};

// Очистка всех задач
const clearAllTasks = async () => {
  if (confirm("Вы действительно хотите удалить все задачи?")) {
    try {
      await taskStore.clearAllTasks();
      // Обновляем список задач после очистки
      await taskStore.fetchStats();
    } catch (error) {
      console.error("Ошибка при очистке задач:", error);
    }
  }
};
</script>
