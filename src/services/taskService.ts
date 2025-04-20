import apiClient, {
  checkApiConnection,
  getLocalData,
  saveLocalData,
} from "./api";

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  time?: string; // Необязательное поле для хранения времени в формате HH:MM
  priority: "high" | "medium" | "low";
  category: string;
  progress: number;
  completed: boolean;
}

export interface TaskStats {
  activeTasks: number;
  urgentTasks: number;
  completedToday: number;
  productivity: number;
  productivityData: Array<{ date: string; value: number }>;
}

const LOCAL_STORAGE_KEY = "intellect_planner_tasks";

class TaskService {
  private useLocalStorage = false;
  private nextId = 1;

  constructor() {
    this.checkConnection();
    this.initNextId();
  }

  private async checkConnection() {
    this.useLocalStorage = !(await checkApiConnection());
    return this.useLocalStorage;
  }

  private initNextId() {
    const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
    if (tasks.length > 0) {
      this.nextId = Math.max(...tasks.map((task) => task.id)) + 1;
    }
  }

  async getAll(): Promise<Task[]> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      return getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
    }

    try {
      const response = await apiClient.get("/tasks");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении задач из API:", error);
      // Если API недоступен, возвращаем данные из localStorage
      return getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
    }
  }

  async getById(id: number): Promise<Task> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error(`Задача с ID ${id} не найдена`);
      return task;
    }

    try {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении задачи с ID ${id}:`, error);
      // Если API недоступен, ищем задачу в localStorage
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error(`Задача с ID ${id} не найдена`);
      return task;
    }
  }

  async create(task: Omit<Task, "id">): Promise<Task> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      const newTask = { ...task, id: this.nextId++ };
      tasks.push(newTask);
      saveLocalData(LOCAL_STORAGE_KEY, tasks);
      return newTask;
    }

    try {
      const response = await apiClient.post("/tasks", task);
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании задачи:", error);
      // Если API недоступен, сохраняем в localStorage
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      const newTask = { ...task, id: this.nextId++ };
      tasks.push(newTask);
      saveLocalData(LOCAL_STORAGE_KEY, tasks);
      return newTask;
    }
  }

  async update(id: number, task: Partial<Task>): Promise<Task> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) throw new Error(`Задача с ID ${id} не найдена`);

      const updatedTask = { ...tasks[index], ...task };
      tasks[index] = updatedTask;
      saveLocalData(LOCAL_STORAGE_KEY, tasks);
      return updatedTask;
    }

    try {
      const response = await apiClient.patch(`/tasks/${id}`, task);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении задачи с ID ${id}:`, error);
      // Если API недоступен, обновляем в localStorage
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) throw new Error(`Задача с ID ${id} не найдена`);

      const updatedTask = { ...tasks[index], ...task };
      tasks[index] = updatedTask;
      saveLocalData(LOCAL_STORAGE_KEY, tasks);
      return updatedTask;
    }
  }

  async delete(id: number): Promise<void> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      let tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      tasks = tasks.filter((t) => t.id !== id);
      saveLocalData(LOCAL_STORAGE_KEY, tasks);
      return;
    }

    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch (error) {
      console.error(`Ошибка при удалении задачи с ID ${id}:`, error);
      // Если API недоступен, удаляем из localStorage
      let tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      tasks = tasks.filter((t) => t.id !== id);
      saveLocalData(LOCAL_STORAGE_KEY, tasks);
    }
  }

  async completeTask(id: number, completed: boolean): Promise<Task> {
    return this.update(id, { completed });
  }

  async updateProgress(id: number, progress: number): Promise<Task> {
    return this.update(id, { progress });
  }

  async getStats(): Promise<TaskStats> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      // Вычисляем статистику на основе локальных задач
      const activeTasks = tasks.filter((task) => !task.completed).length;
      const urgentTasks = tasks.filter(
        (task) => !task.completed && task.priority === "high"
      ).length;
      const completedToday = tasks.filter((task) => {
        if (!task.completed) return false;
        // Проверяем, была ли задача завершена сегодня
        // Здесь бы потребовалось поле completedDate, но для простоты просто вернем
        // небольшое случайное число для демонстрации
        return true;
      }).length;

      return {
        activeTasks,
        urgentTasks,
        completedToday,
        productivity: Math.round(Math.random() * 100), // Для демонстрации
        productivityData: Array(7)
          .fill(null)
          .map((_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            value: Math.round(Math.random() * 100),
          })),
      };
    }

    try {
      const response = await apiClient.get("/stats");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);
      // Если API недоступен, возвращаем моковую статистику
      return {
        activeTasks: 0,
        urgentTasks: 0,
        completedToday: 0,
        productivity: 0,
        productivityData: [],
      };
    }
  }
}

export default new TaskService();
