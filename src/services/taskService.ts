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

      // Получаем сегодняшнюю дату в формате YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];

      // Считаем задачи, завершенные сегодня (предполагаем, что у задачи есть поле completedDate)
      // Поскольку completedDate может отсутствовать, используем приблизительный подсчет
      const completedToday = tasks.filter((task) => task.completed).length;

      // Рассчитываем продуктивность как отношение выполненных задач к общему количеству
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task) => task.completed).length;
      const productivity =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Создаем данные для графика продуктивности за последние 7 дней
      // Используем реальные данные вместо случайных
      const lastWeekDates = Array(7)
        .fill(null)
        .map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split("T")[0];
        });

      // В реальном приложении здесь был бы более сложный расчет на основе дат завершения
      // Но для примера просто используем текущую продуктивность
      const productivityData = lastWeekDates.map((date) => ({
        date,
        value: productivity,
      }));

      return {
        activeTasks,
        urgentTasks,
        completedToday,
        productivity,
        productivityData,
      };
    }

    try {
      const response = await apiClient.get("/stats");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);

      // Если API недоступен, рассчитываем статистику из локальных задач
      const tasks = getLocalData<Task[]>(LOCAL_STORAGE_KEY, []);
      const activeTasks = tasks.filter((task) => !task.completed).length;
      const urgentTasks = tasks.filter(
        (task) => !task.completed && task.priority === "high"
      ).length;
      const completedTasks = tasks.filter((task) => task.completed).length;
      const totalTasks = tasks.length;
      const productivity =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        activeTasks,
        urgentTasks,
        completedToday: completedTasks,
        productivity,
        productivityData: [],
      };
    }
  }

  // Метод для очистки локального хранилища задач
  clearLocalTasks(): void {
    saveLocalData(LOCAL_STORAGE_KEY, []);
    this.nextId = 1;
  }
}

export default new TaskService();
