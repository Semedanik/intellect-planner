import apiClient from "./api";

export interface Event {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  icon: string;
  colorClass: string;
}

class EventService {
  async getAll(): Promise<Event[]> {
    const response = await apiClient.get("/events");
    return response.data;
  }

  async getById(id: number): Promise<Event> {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  }

  async create(event: Omit<Event, "id">): Promise<Event> {
    const response = await apiClient.post("/events", event);
    return response.data;
  }

  async update(id: number, event: Partial<Event>): Promise<Event> {
    const response = await apiClient.patch(`/events/${id}`, event);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  }
}

export default new EventService();
