import apiClient from "./api";

export interface Stats {
  activeTasks: number;
  urgentTasks: number;
  completedToday: number;
  productivity: number;
  productivityData: number[];
}

class StatService {
  async getStats(): Promise<Stats> {
    const response = await apiClient.get("/stats");
    return response.data;
  }

  async updateStats(stats: Partial<Stats>): Promise<Stats> {
    const response = await apiClient.patch("/stats", stats);
    return response.data;
  }
}

export default new StatService();
