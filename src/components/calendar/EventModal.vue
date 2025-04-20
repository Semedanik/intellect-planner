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
                {{
                  isEdit ? "Редактировать событие" : "Добавить новое событие"
                }}
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
                      v-model="eventForm.title"
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
                      v-model="eventForm.description"
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
                        v-model="eventForm.type"
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Выберите категорию</option>
                        <option
                          v-for="category in categories"
                          :key="category.id"
                          :value="category.name"
                          :style="{ color: category.color }"
                        >
                          {{ category.name }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label
                      for="eventDate"
                      class="block text-sm font-medium text-gray-700"
                      >Срок выполнения</label
                    >
                    <div class="flex space-x-2">
                      <div class="flex-1">
                        <input
                          type="date"
                          id="eventDate"
                          v-model="eventForm.date"
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div class="w-32">
                        <input
                          type="time"
                          id="eventTime"
                          v-model="eventForm.time"
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="createTask"
                        v-model="isCreateTask"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        :disabled="eventForm.isTaskLinked"
                      />
                      <label
                        for="createTask"
                        class="ml-2 block text-sm text-gray-900"
                      >
                        {{
                          eventForm.isTaskLinked
                            ? "Связано с задачей"
                            : isEdit
                              ? "Создать связанную задачу"
                              : "Создать задачу из события"
                        }}
                      </label>
                    </div>
                    <p
                      v-if="eventForm.linkedTaskId"
                      class="mt-1 text-xs text-gray-500"
                    >
                      Задача #{{ eventForm.linkedTaskId }} будет автоматически
                      обновлена
                    </p>
                  </div>

                  <div class="mb-4">
                    <label
                      for="priority"
                      class="block text-sm font-medium text-gray-700"
                      >Приоритет</label
                    >
                    <select
                      id="priority"
                      v-model="eventForm.priority"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                      >Прогресс выполнения: {{ eventForm.progress }}%</label
                    >
                    <input
                      type="range"
                      id="progress"
                      v-model="eventForm.progress"
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
                        v-model="eventForm.completed"
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
import { ref, computed, reactive, watch } from "vue";
import { useEventStore } from "@/stores/events";
import { useTaskStore } from "@/stores/tasks";
import type { Event } from "@/services/eventService";
import type { Task } from "@/services/taskService";
import { format } from "date-fns";
import { categoryService } from "@/services";
import type { Category } from "@/services/categoryService";

// Расширяем интерфейс Event дополнительными полями
interface EventExtended extends Event {
  priority?: string;
  progress?: number;
  completed?: boolean;
  isTaskLinked?: boolean;
  linkedTaskId?: number;
}

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object as () => EventExtended | null,
    default: null,
  },
  selectedDate: {
    type: Date,
    default: () => new Date(),
  },
  selectedTime: {
    type: String,
    default: "09:00",
  },
});

const emit = defineEmits(["close", "submit"]);

const eventStore = useEventStore();
const taskStore = useTaskStore();
const categories = ref<Category[]>([]);
const isCreateTask = ref(false);

// Загружаем категории при монтировании компонента
const loadCategories = async () => {
  try {
    categories.value = await categoryService.getAll();
  } catch (error) {
    console.error("Ошибка при загрузке категорий:", error);
  }
};

loadCategories();

const defaultEvent: EventExtended = {
  id: 0,
  title: "",
  type: "",
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  icon: "fas fa-calendar-day",
  colorClass: "bg-blue-100 text-blue-600",
  description: "",
  priority: "medium",
  progress: 0,
  completed: false,
  isTaskLinked: false,
  linkedTaskId: undefined,
};

// Устанавливаем категорию по умолчанию после загрузки категорий
watch(
  categories,
  (newCategories) => {
    if (newCategories.length > 0 && !eventForm.type) {
      eventForm.type = newCategories[0].name;
    }
  },
  { immediate: true }
);

const eventForm = reactive<EventExtended>({ ...defaultEvent });

const isEdit = computed(() => props.event !== null);

// Проверяем, связано ли событие с задачей
const checkIfEventLinkedToTask = (event: EventExtended) => {
  if (event.externalId && event.externalId.startsWith("task-")) {
    const taskIdMatch = event.externalId.match(/task-(\d+):/);
    if (taskIdMatch && taskIdMatch[1]) {
      return {
        isTaskLinked: true,
        linkedTaskId: parseInt(taskIdMatch[1], 10),
      };
    }
  }
  return {
    isTaskLinked: false,
    linkedTaskId: undefined,
  };
};

// Извлекаем метаданные из externalId
const extractMetadataFromExternalId = (externalId: string | undefined) => {
  if (!externalId) return { priority: "medium", progress: 0, completed: false };

  try {
    if (externalId.includes("task-metadata:")) {
      const metadataJSON = externalId.split("task-metadata:")[1];
      return JSON.parse(metadataJSON);
    }
    return { priority: "medium", progress: 0, completed: false };
  } catch (e) {
    console.error("Ошибка при извлечении метаданных:", e);
    return { priority: "medium", progress: 0, completed: false };
  }
};

// Следим за изменениями входных свойств
watch(
  () => props.event,
  (newVal) => {
    if (newVal) {
      // Если редактируем существующее событие
      // Проверяем, связано ли событие с задачей
      const { isTaskLinked, linkedTaskId } = checkIfEventLinkedToTask(newVal);

      // Извлекаем метаданные из externalId
      const metadata = extractMetadataFromExternalId(newVal.externalId);

      Object.assign(eventForm, {
        ...newVal,
        priority: metadata.priority || "medium",
        progress: metadata.progress || 0,
        completed: metadata.completed || false,
        isTaskLinked,
        linkedTaskId,
      });

      // Устанавливаем флаг создания задачи в false, так как событие уже существует
      isCreateTask.value = false;
    } else {
      // Если создаем новое событие
      Object.assign(eventForm, defaultEvent);
      // Если передана дата и время, используем их
      eventForm.date = format(props.selectedDate, "yyyy-MM-dd");
      eventForm.time = props.selectedTime;

      // Устанавливаем первую категорию из списка если есть
      if (categories.value.length > 0) {
        eventForm.type = categories.value[0].name;
      }

      // По умолчанию предлагаем создать задачу для нового события
      isCreateTask.value = true;
    }
  },
  { immediate: true }
);

const closeModal = () => {
  emit("close");
};

// Получаем цвет и иконку на основе выбранной категории
const getCategoryColorAndIcon = () => {
  const category = categories.value.find((c) => c.name === eventForm.type);
  if (category) {
    // Формируем colorClass на основе цвета категории (hexcode)
    const colorHex = category.color;
    return {
      colorClass: `bg-${getColorName(colorHex)}-100 text-${getColorName(colorHex)}-600`,
      icon: getIconByCategory(category.name),
    };
  }
  return {
    colorClass: "bg-blue-100 text-blue-600",
    icon: "fas fa-calendar-day",
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
    default: "fas fa-calendar-day",
  };
  return iconMap[categoryName] || iconMap.default;
};

// Создание задачи из события
const createTaskFromEvent = async () => {
  try {
    // Создаем объект задачи на основе данных события
    const taskData: Omit<Task, "id"> = {
      title: eventForm.title,
      description: eventForm.description || "",
      category: eventForm.type || "Задача",
      dueDate: eventForm.date,
      time: eventForm.time,
      priority: (eventForm.priority as "high" | "medium" | "low") || "medium",
      progress: eventForm.progress || 0,
      completed: eventForm.completed || false,
    };

    // Добавляем задачу в хранилище
    await taskStore.addTask(taskData);

    // Находим созданную задачу по заголовку и сроку
    const newTask = taskStore.tasks
      .filter(
        (task) =>
          task.title === taskData.title && task.dueDate === taskData.dueDate
      )
      .sort((a, b) => b.id - a.id)[0]; // Берем задачу с наибольшим ID

    return newTask?.id;
  } catch (error) {
    console.error("Ошибка при создании задачи:", error);
    return undefined;
  }
};

// Обновление связанной задачи
const updateLinkedTask = async (taskId: number) => {
  try {
    // Обновляем задачу на основе данных события
    const taskData: Partial<Task> = {
      title: eventForm.title,
      description: eventForm.description || "",
      category: eventForm.type || "Задача",
      dueDate: eventForm.date,
      time: eventForm.time,
      priority: (eventForm.priority as "high" | "medium" | "low") || "medium",
      progress: eventForm.progress || 0,
      completed: eventForm.completed || false,
    };

    // Обновляем задачу в хранилище
    await taskStore.updateTask(taskId, taskData);
  } catch (error) {
    console.error(`Ошибка при обновлении задачи с ID ${taskId}:`, error);
  }
};

const handleSubmit = async () => {
  try {
    // Получаем цвет и иконку на основе выбранной категории
    const { colorClass, icon } = getCategoryColorAndIcon();

    // Создаем объект события для сохранения
    const eventData: Partial<Event> = {
      title: eventForm.title,
      type: eventForm.type || "Встреча",
      date: eventForm.date,
      time: eventForm.time,
      icon,
      colorClass,
      description: eventForm.description,
    };

    // Обрабатываем связь с задачей
    let linkedTaskId = eventForm.linkedTaskId;
    let externalId;

    if (isCreateTask.value && !linkedTaskId) {
      // Если нужно создать новую задачу
      linkedTaskId = await createTaskFromEvent();
      if (linkedTaskId) {
        externalId = `task-${linkedTaskId}:${JSON.stringify({
          priority: eventForm.priority,
          progress: eventForm.progress,
          completed: eventForm.completed,
        })}`;
      } else {
        // Если не удалось создать задачу, сохраняем только метаданные
        externalId = `task-metadata:${JSON.stringify({
          priority: eventForm.priority,
          progress: eventForm.progress,
          completed: eventForm.completed,
        })}`;
      }
    } else if (linkedTaskId) {
      // Если событие уже связано с задачей, обновляем её
      await updateLinkedTask(linkedTaskId);
      externalId = `task-${linkedTaskId}:${JSON.stringify({
        priority: eventForm.priority,
        progress: eventForm.progress,
        completed: eventForm.completed,
      })}`;
    } else {
      // Если это просто событие без связи с задачей
      externalId = `task-metadata:${JSON.stringify({
        priority: eventForm.priority,
        progress: eventForm.progress,
        completed: eventForm.completed,
      })}`;
    }

    eventData.externalId = externalId;

    if (isEdit.value && props.event) {
      await eventStore.updateEvent(props.event.id, eventData);
    } else {
      await eventStore.addEvent(eventData as Omit<Event, "id">);
    }

    emit("submit");
    closeModal();

    // Сбрасываем форму
    Object.assign(eventForm, defaultEvent);
    isCreateTask.value = false;
  } catch (error) {
    console.error("Ошибка при сохранении события:", error);
  }
};
</script>
