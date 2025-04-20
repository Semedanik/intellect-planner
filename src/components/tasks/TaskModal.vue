<template>
  <div v-if="isOpen" class="fixed z-10 inset-0 overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ isEdit ? "Редактировать задачу" : "Добавить новую задачу" }}
              </h3>

              <div class="mt-4">
                <form @submit.prevent="handleSubmit">
                  <div class="mb-4">
                    <label
                      for="title"
                      class="block text-sm font-medium text-gray-700"
                      >Заголовок</label
                    >
                    <input
                      type="text"
                      id="title"
                      v-model="taskForm.title"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div class="mb-4">
                    <label
                      for="description"
                      class="block text-sm font-medium text-gray-700"
                      >Описание</label
                    >
                    <textarea
                      id="description"
                      v-model="taskForm.description"
                      rows="3"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>

                  <div class="mb-4">
                    <label
                      for="category"
                      class="block text-sm font-medium text-gray-700"
                      >Категория</label
                    >
                    <div class="relative">
                      <select
                        id="category"
                        v-model="taskForm.category"
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        :class="{ hidden: isNewCategory }"
                        required
                      >
                        <option value="">Выберите категорию</option>
                        <option
                          v-for="category in categories"
                          :key="category.id"
                          :value="category.name"
                        >
                          {{ category.name }}
                        </option>
                        <option value="new-category">
                          + Создать новую категорию
                        </option>
                      </select>

                      <!-- Форма создания новой категории -->
                      <div v-if="isNewCategory" class="mt-2 space-y-2">
                        <div>
                          <input
                            type="text"
                            v-model="newCategory.name"
                            placeholder="Название категории"
                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            v-model="newCategory.description"
                            placeholder="Описание (необязательно)"
                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700"
                            >Цвет</label
                          >
                          <div class="mt-1 flex space-x-2">
                            <template
                              v-for="color in availableColors"
                              :key="color"
                            >
                              <div
                                class="w-6 h-6 rounded-full cursor-pointer border"
                                :style="{ backgroundColor: color }"
                                :class="{
                                  'ring-2 ring-offset-2 ring-indigo-500':
                                    newCategory.color === color,
                                }"
                                @click="newCategory.color = color"
                              ></div>
                            </template>
                          </div>
                        </div>
                        <div class="flex space-x-2">
                          <button
                            type="button"
                            @click="createCategory"
                            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                          >
                            Создать
                          </button>
                          <button
                            type="button"
                            @click="cancelNewCategory"
                            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label
                      for="dueDate"
                      class="block text-sm font-medium text-gray-700"
                      >Срок выполнения</label
                    >
                    <div class="flex space-x-2">
                      <div class="flex-1">
                        <input
                          type="date"
                          id="dueDate"
                          v-model="taskForm.dueDate"
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div class="w-32">
                        <input
                          type="time"
                          id="dueTime"
                          v-model="taskForm.time"
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label
                      for="priority"
                      class="block text-sm font-medium text-gray-700"
                      >Приоритет</label
                    >
                    <select
                      id="priority"
                      v-model="taskForm.priority"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="high">Высокий</option>
                      <option value="medium">Средний</option>
                      <option value="low">Низкий</option>
                    </select>
                  </div>

                  <div class="mb-4" v-if="isEdit">
                    <label
                      for="progress"
                      class="block text-sm font-medium text-gray-700"
                      >Прогресс выполнения: {{ taskForm.progress }}%</label
                    >
                    <input
                      type="range"
                      id="progress"
                      v-model="taskForm.progress"
                      min="0"
                      max="100"
                      step="5"
                      class="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div
                      class="flex justify-between text-xs text-gray-500 mt-1"
                    >
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div class="mb-4" v-if="isEdit">
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="completed"
                        v-model="taskForm.completed"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        for="completed"
                        class="ml-2 block text-sm text-gray-900"
                        >Отметить как выполненное</label
                      >
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleSubmit"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {{ isEdit ? "Сохранить" : "Добавить" }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";
import { categoryService } from "@/services";
import type { Task } from "@/services/taskService";
import type { Category } from "@/services/categoryService";
import { useTaskStore } from "@/stores/tasks";
import { useEventStore } from "@/stores/events";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object as () => Task | null,
    default: null,
  },
});

const emit = defineEmits(["close", "submit"]);

const taskStore = useTaskStore();
const eventStore = useEventStore();
const categories = ref<Category[]>([]);
const isNewCategory = ref(false);
const availableColors = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6366f1",
  "#06b6d4",
  "#14b8a6",
  "#f97316",
  "#dc2626",
  "#a855f7",
];

const newCategory = reactive<Omit<Category, "id">>({
  name: "",
  description: "",
  color: "#4f46e5",
});

const defaultTask: Omit<Task, "id"> = {
  title: "",
  description: "",
  category: "",
  dueDate: new Date().toISOString().split("T")[0],
  time: "09:00",
  priority: "medium",
  progress: 0,
  completed: false,
};

const taskForm = reactive<Omit<Task, "id">>({ ...defaultTask });

const isEdit = computed(() => props.task !== null);

onMounted(async () => {
  try {
    categories.value = await categoryService.getAll();
  } catch (error) {
    console.error("Ошибка при загрузке категорий:", error);
  }
});

watch(
  () => props.task,
  (newVal) => {
    if (newVal) {
      Object.assign(taskForm, newVal);
    } else {
      Object.assign(taskForm, defaultTask);
    }
  },
  { immediate: true }
);

watch(
  () => taskForm.category,
  (newVal) => {
    if (newVal === "new-category") {
      isNewCategory.value = true;
      taskForm.category = ""; // Сбрасываем значение, чтобы потом заполнить его новой категорией
    }
  }
);

const closeModal = () => {
  isNewCategory.value = false;
  emit("close");
};

const cancelNewCategory = () => {
  isNewCategory.value = false;
  taskForm.category = "";
  newCategory.name = "";
  newCategory.description = "";
  newCategory.color = "#4f46e5";
};

const createCategory = async () => {
  if (!newCategory.name) {
    alert("Пожалуйста, введите название категории");
    return;
  }

  try {
    const createdCategory = await categoryService.create(newCategory);
    categories.value.push(createdCategory);
    taskForm.category = createdCategory.name;
    isNewCategory.value = false;
    // Сбрасываем форму
    newCategory.name = "";
    newCategory.description = "";
    newCategory.color = "#4f46e5";
  } catch (error) {
    console.error("Ошибка при создании категории:", error);
  }
};

// Получение цвета и иконки для категории
const getCategoryColorAndIcon = (categoryName: string) => {
  // Находим категорию по имени
  const category = categories.value.find((c) => c.name === categoryName);

  if (category) {
    // Получаем цвет категории
    const colorHex = category.color;

    // Получаем имя цвета для Tailwind
    const colorName = getColorName(colorHex);

    // Получаем иконку по категории
    const icon = getIconByCategory(categoryName);

    return {
      colorClass: `bg-${colorName}-100 text-${colorName}-600`,
      icon: icon,
    };
  }

  // Если категория не найдена, возвращаем значения по умолчанию
  return {
    colorClass: "bg-blue-100 text-blue-600",
    icon: "fas fa-tasks",
  };
};

// Функция для преобразования hex-цвета в имя цвета Tailwind
const getColorName = (hexColor: string) => {
  // Простая реализация сопоставления hex-цветов с именами Tailwind
  const colorMap: Record<string, string> = {
    "#4f46e5": "indigo",
    "#0ea5e9": "blue",
    "#10b981": "green",
    "#f59e0b": "yellow",
    "#ef4444": "red",
    "#8b5cf6": "purple",
    "#6366f1": "indigo",
    "#06b6d4": "cyan",
    "#14b8a6": "teal",
    "#f97316": "orange",
    "#dc2626": "red",
    "#a855f7": "purple",
  };
  return colorMap[hexColor] || "blue";
};

// Функция для получения иконки по категории
const getIconByCategory = (categoryName: string) => {
  // Простое сопоставление категорий с иконками
  const iconMap: Record<string, string> = {
    Учеба: "fas fa-book",
    Работа: "fas fa-briefcase",
    Личное: "fas fa-user",
    Дом: "fas fa-home",
    Здоровье: "fas fa-heartbeat",
    Хобби: "fas fa-guitar",
    // По умолчанию
    default: "fas fa-tasks",
  };
  return iconMap[categoryName] || iconMap.default;
};

// Создание события календаря на основе задачи
const createCalendarEvent = async (taskId: number) => {
  if (!taskForm.dueDate) return; // Если дата не установлена, не создаем событие

  // Получаем цвет и иконку на основе категории
  const { colorClass, icon } = getCategoryColorAndIcon(taskForm.category);

  // Метаданные задачи для хранения в событии календаря
  const metadata = {
    taskId: taskId,
    priority: taskForm.priority,
    progress: taskForm.progress,
    completed: taskForm.completed,
  };

  // Создаем событие календаря
  const event = {
    title: taskForm.title,
    type: taskForm.category || "Задача",
    date: taskForm.dueDate,
    time: taskForm.time || "09:00",
    icon: icon,
    colorClass: colorClass,
    description: taskForm.description,
    externalId: `task-${taskId}:${JSON.stringify(metadata)}`,
  };

  // Добавляем событие в календарь
  await eventStore.addEvent(event);
};

// Обновление события календаря на основе задачи
const updateCalendarEvent = async (taskId: number) => {
  // Найдем существующее событие календаря, связанное с этой задачей
  const events = eventStore.events;
  const existingEvent = events.find(
    (event) =>
      event.externalId && event.externalId.startsWith(`task-${taskId}:`)
  );

  // Если задача больше не имеет срока, но событие существует - удаляем его
  if (!taskForm.dueDate && existingEvent) {
    await eventStore.deleteEvent(existingEvent.id);
    return;
  }

  // Если задача имеет срок
  if (taskForm.dueDate) {
    // Получаем цвет и иконку на основе категории
    const { colorClass, icon } = getCategoryColorAndIcon(taskForm.category);

    // Метаданные задачи
    const metadata = {
      taskId: taskId,
      priority: taskForm.priority,
      progress: taskForm.progress,
      completed: taskForm.completed,
    };

    // Создаем/обновляем объект события
    const eventData = {
      title: taskForm.title,
      type: taskForm.category || "Задача",
      date: taskForm.dueDate,
      time: taskForm.time || "09:00",
      icon: icon,
      colorClass: colorClass,
      description: taskForm.description,
      externalId: `task-${taskId}:${JSON.stringify(metadata)}`,
    };

    // Если событие уже существует - обновляем, иначе создаем новое
    if (existingEvent) {
      await eventStore.updateEvent(existingEvent.id, eventData);
    } else {
      await eventStore.addEvent(eventData);
    }
  }
};

const handleSubmit = async () => {
  try {
    if (isEdit.value && props.task) {
      // Обновляем существующую задачу
      await taskStore.updateTask(props.task.id, taskForm as Partial<Task>);
      // Обновляем соответствующее событие в календаре
      await updateCalendarEvent(props.task.id);
    } else {
      // Сохраняем копию заголовка для поиска задачи после создания
      const taskTitle = taskForm.title;
      const taskDueDate = taskForm.dueDate;

      // Создаем новую задачу
      await taskStore.addTask(taskForm);

      // Находим только что созданную задачу по заголовку и дате
      // Предполагаем, что последняя добавленная задача с таким заголовком и датой - это наша задача
      const newTask = taskStore.tasks
        .filter(
          (task) => task.title === taskTitle && task.dueDate === taskDueDate
        )
        .sort((a, b) => b.id - a.id)[0]; // Берем задачу с наибольшим ID

      if (newTask && taskForm.dueDate) {
        // Если задача найдена и имеет срок выполнения, создаем событие в календаре
        await createCalendarEvent(newTask.id);
      }
    }

    emit("submit");
    closeModal();

    // Сбрасываем форму
    Object.assign(taskForm, defaultTask);
  } catch (error) {
    console.error("Ошибка при сохранении задачи:", error);
  }
};
</script>
