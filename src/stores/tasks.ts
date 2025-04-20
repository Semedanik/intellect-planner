import { defineStore } from "pinia";
import { taskService } from "@/services";
import type { Task, TaskStats } from "@/services/taskService";
import { useEventStore } from "./events";
import type { Event } from "@/services/eventService";

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  stats: TaskStats | null;
  filters: {
    category: string;
    search: string;
    priority: string;
    status: string;
  };
}

// Вспомогательная функция для преобразования задачи в событие календаря
const taskToEvent = (task: Task): Omit<Event, "id"> => {
  // Определяем цвет и иконку в зависимости от приоритета
  let colorClass = "bg-green-100 text-green-800";
  let icon = "fas fa-tasks";

  if (task.priority === "high") {
    colorClass = "bg-red-100 text-red-800";
    icon = "fas fa-exclamation-circle";
  } else if (task.priority === "medium") {
    colorClass = "bg-yellow-100 text-yellow-800";
    icon = "fas fa-exclamation";
  }

  return {
    title: task.title,
    type: "task",
    date: task.dueDate,
    time: task.time || "09:00", // Используем время из задачи или по умолчанию
    icon,
    colorClass,
    description: task.description,
    externalId: `task-${task.id}`, // Используем это поле для связи с задачей
  };
};

export const useTaskStore = defineStore("tasks", {
  state: (): TaskState => ({
    tasks: [],
    isLoading: false,
    error: null,
    stats: null,
    filters: {
      category: "",
      search: "",
      priority: "",
      status: "",
    },
  }),

  getters: {
    getTaskByCategory(state) {
      return (category: string) => {
        if (!category) return state.tasks;
        return state.tasks.filter((task) => task.category === category);
      };
    },
    filteredTasks(state): Task[] {
      return state.tasks.filter((task) => {
        // Фильтр по категории
        if (
          state.filters.category &&
          task.category !== state.filters.category
        ) {
          return false;
        }

        // Фильтр по поиску (заголовок или описание)
        if (
          state.filters.search &&
          !task.title
            .toLowerCase()
            .includes(state.filters.search.toLowerCase()) &&
          !task.description
            .toLowerCase()
            .includes(state.filters.search.toLowerCase())
        ) {
          return false;
        }

        // Фильтр по приоритету
        if (
          state.filters.priority &&
          task.priority !== state.filters.priority
        ) {
          return false;
        }

        // Фильтр по статусу (завершено/не завершено)
        if (state.filters.status === "completed" && !task.completed) {
          return false;
        }
        if (state.filters.status === "active" && task.completed) {
          return false;
        }

        return true;
      });
    },
  },

  actions: {
    async fetchTasks() {
      this.isLoading = true;
      try {
        this.tasks = await taskService.getAll();
        this.error = null;
      } catch (error: any) {
        this.error = error.message || "Не удалось загрузить задачи";
        console.error("Ошибка при загрузке задач:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addTask(task: Omit<Task, "id">) {
      this.isLoading = true;
      try {
        const newTask = await taskService.create(task);
        this.tasks.push(newTask);
        this.error = null;

        // Добавляем задачу в календарь как событие
        const eventStore = useEventStore();
        await eventStore.addEvent(taskToEvent(newTask));
      } catch (error: any) {
        this.error = error.message || "Не удалось добавить задачу";
        console.error("Ошибка при добавлении задачи:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async updateTask(taskId: number, task: Partial<Task>) {
      this.isLoading = true;
      try {
        const updatedTask = await taskService.update(taskId, task);
        const index = this.tasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...updatedTask };
        }
        this.error = null;

        // Обновляем или создаем соответствующее событие в календаре
        const eventStore = useEventStore();

        // Сначала попробуем найти существующее событие по externalId
        const externalId = `task-${taskId}`;
        const eventIndex = eventStore.events.findIndex(
          (e) => e.externalId === externalId
        );

        if (eventIndex !== -1) {
          // Если событие существует, обновляем его
          const eventId = eventStore.events[eventIndex].id;
          await eventStore.updateEvent(eventId, taskToEvent(this.tasks[index]));
        } else {
          // Если события нет, создаем новое
          await eventStore.addEvent(taskToEvent(this.tasks[index]));
        }
      } catch (error: any) {
        this.error = error.message || "Не удалось обновить задачу";
        console.error("Ошибка при обновлении задачи:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async deleteTask(taskId: number) {
      this.isLoading = true;
      try {
        await taskService.delete(taskId);
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
        this.error = null;

        // Удаляем соответствующее событие из календаря
        const eventStore = useEventStore();
        const externalId = `task-${taskId}`;
        const event = eventStore.events.find(
          (e) => e.externalId === externalId
        );

        if (event) {
          await eventStore.deleteEvent(event.id);
        }
      } catch (error: any) {
        this.error = error.message || "Не удалось удалить задачу";
        console.error("Ошибка при удалении задачи:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchStats() {
      this.isLoading = true;
      try {
        this.stats = await taskService.getStats();
        this.error = null;
      } catch (error: any) {
        this.error = error.message || "Не удалось загрузить статистику";
        console.error("Ошибка при загрузке статистики:", error);
      } finally {
        this.isLoading = false;
      }
    },

    setCategoryFilter(category: string) {
      this.filters.category = category;
    },

    setFilters(filters: Partial<TaskState["filters"]>) {
      this.filters = { ...this.filters, ...filters };
    },
  },
});
