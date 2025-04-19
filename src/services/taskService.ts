import apiClient from "./api";

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  subject: string;
  progress: number;
  completed: boolean;
}

class TaskService {
  async getAll(): Promise<Task[]> {
    const response = await apiClient.get("/tasks");
    return response.data;
  }

  async getById(id: number): Promise<Task> {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  }

  async create(task: Omit<Task, "id">): Promise<Task> {
    const response = await apiClient.post("/tasks", task);
    return response.data;
  }

  async update(id: number, task: Partial<Task>): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${id}`, task);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }

  async completeTask(id: number, completed: boolean): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${id}`, { completed });
    return response.data;
  }

  async updateProgress(id: number, progress: number): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${id}`, { progress });
    return response.data;
  }
}

export default new TaskService();
