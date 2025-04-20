import apiClient, {
  checkApiConnection,
  getLocalData,
  saveLocalData,
} from "./api";

export interface Stats {
  activeTasks: number;
  urgentTasks: number;
  completedToday: number;
  productivity: number;
  productivityData: number[];
}

const LOCAL_STORAGE_KEY = "intellect_planner_stats";

// Значения статистики по умолчанию
const DEFAULT_STATS: Stats = {
  activeTasks: 0,
  urgentTasks: 0,
  completedToday: 0,
  productivity: 0,
  productivityData: [0, 0, 0, 0, 0, 0, 0],
};

class StatService {
  private useLocalStorage = false;

  constructor() {
    this.checkConnection();
  }

  private async checkConnection() {
    this.useLocalStorage = !(await checkApiConnection());
    return this.useLocalStorage;
  }

  async getStats(): Promise<Stats> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      return getLocalData<Stats>(LOCAL_STORAGE_KEY, DEFAULT_STATS);
    }

    try {
      const response = await apiClient.get("/stats");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении статистики из API:", error);
      // Если API недоступен, возвращаем данные из localStorage
      return getLocalData<Stats>(LOCAL_STORAGE_KEY, DEFAULT_STATS);
    }
  }

  async updateStats(stats: Partial<Stats>): Promise<Stats> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const currentStats = getLocalData<Stats>(
        LOCAL_STORAGE_KEY,
        DEFAULT_STATS
      );
      const updatedStats = { ...currentStats, ...stats };
      saveLocalData(LOCAL_STORAGE_KEY, updatedStats);
      return updatedStats;
    }

    try {
      const response = await apiClient.patch("/stats", stats);
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении статистики в API:", error);
      // Если API недоступен, обновляем в localStorage
      const currentStats = getLocalData<Stats>(
        LOCAL_STORAGE_KEY,
        DEFAULT_STATS
      );
      const updatedStats = { ...currentStats, ...stats };
      saveLocalData(LOCAL_STORAGE_KEY, updatedStats);
      return updatedStats;
    }
  }
}

export default new StatService();
