import apiClient from "./api";

export interface Class {
  id: number;
  time: string;
  day: string;
  subject: string;
  type: string;
  location: string;
  subjectId: number;
}

class ClassService {
  async getAll(): Promise<Class[]> {
    const response = await apiClient.get("/classes");
    return response.data;
  }

  async getById(id: number): Promise<Class> {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  }

  async create(classItem: Omit<Class, "id">): Promise<Class> {
    const response = await apiClient.post("/classes", classItem);
    return response.data;
  }

  async update(id: number, classItem: Partial<Class>): Promise<Class> {
    const response = await apiClient.patch(`/classes/${id}`, classItem);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  }

  async getByDay(day: string): Promise<Class[]> {
    const response = await apiClient.get(`/classes?day=${day}`);
    return response.data;
  }
}

export default new ClassService();
