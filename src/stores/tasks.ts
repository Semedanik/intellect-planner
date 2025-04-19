import { defineStore } from "pinia";
import { taskService, statService, Task, Stats } from "../services";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  stats: Stats | null;
}

export const useTaskStore = defineStore("tasks", {
  state: (): TaskState => ({
    tasks: [],
    isLoading: false,
    error: null,
    stats: null,
  }),

  actions: {
    async fetchTasks() {
      this.isLoading = true;
      this.error = null;
      try {
        this.tasks = await taskService.getAll();
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при загрузке задач";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchStats() {
      this.isLoading = true;
      this.error = null;
      try {
        this.stats = await statService.getStats();
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при загрузке статистики";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async addTask(task: Omit<Task, "id">) {
      this.isLoading = true;
      this.error = null;
      try {
        const newTask = await taskService.create(task);
        this.tasks.push(newTask);

        // Обновляем статистику
        if (this.stats) {
          this.stats.activeTasks += 1;
          if (task.priority === "high") {
            this.stats.urgentTasks += 1;
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при добавлении задачи";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async updateTask(id: number, taskData: Partial<Task>) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedTask = await taskService.update(id, taskData);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при обновлении задачи";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async completeTask(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const task = this.tasks.find((t) => t.id === id);
        if (!task) return;

        const updatedTask = await taskService.completeTask(id, true);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }

        // Статистика автоматически обновится на сервере благодаря
        // нашей кастомной логике в server.js
        await this.fetchStats();
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при выполнении задачи";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async deleteTask(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const task = this.tasks.find((t) => t.id === id);
        if (!task) return;

        await taskService.delete(id);
        this.tasks = this.tasks.filter((t) => t.id !== id);

        // Обновляем статистику
        if (this.stats) {
          if (!task.completed) {
            this.stats.activeTasks -= 1;
            if (task.priority === "high") {
              this.stats.urgentTasks -= 1;
            }
          } else {
            this.stats.completedToday -= 1;
          }
          await statService.updateStats(this.stats);
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при удалении задачи";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async updateTaskProgress(id: number, progress: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedTask = await taskService.updateProgress(id, progress);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при обновлении прогресса задачи";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },

  getters: {
    getTaskBySubject: (state) => (subject: string) => {
      return state.tasks.filter((task) => task.subject === subject);
    },

    priorityTasks: (state) => {
      return state.tasks.filter((task) => !task.completed);
    },

    completedTasks: (state) => {
      return state.tasks.filter((task) => task.completed);
    },

    activeTasks: (state) => {
      return state.stats?.activeTasks || 0;
    },

    urgentTasks: (state) => {
      return state.stats?.urgentTasks || 0;
    },

    completedToday: (state) => {
      return state.stats?.completedToday || 0;
    },

    productivity: (state) => {
      return state.stats?.productivity || 0;
    },

    productivityData: (state) => {
      return state.stats?.productivityData || [];
    },
  },
});
