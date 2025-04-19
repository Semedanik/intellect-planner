import apiClient from "./api";

export interface Subject {
  id: number;
  name: string;
  teacher: string;
  color: string;
}

class SubjectService {
  async getAll(): Promise<Subject[]> {
    const response = await apiClient.get("/subjects");
    return response.data;
  }

  async getById(id: number): Promise<Subject> {
    const response = await apiClient.get(`/subjects/${id}`);
    return response.data;
  }

  async create(subject: Omit<Subject, "id">): Promise<Subject> {
    const response = await apiClient.post("/subjects", subject);
    return response.data;
  }

  async update(id: number, subject: Partial<Subject>): Promise<Subject> {
    const response = await apiClient.patch(`/subjects/${id}`, subject);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
  }
}

export default new SubjectService();
