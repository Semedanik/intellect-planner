import apiClient from "./api";
import axios from "axios";
import { Event } from "./eventService";

export interface YandexCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
}

export interface YandexCalendarConfig {
  accessToken: string;
  calendarId: string;
}

class YandexCalendarService {
  private config: YandexCalendarConfig | null = null;
  private static API_BASE_URL = "https://calendar.yandex.ru/api/v1";

  // Метод для установки конфигурации
  setConfig(config: YandexCalendarConfig): void {
    this.config = config;
    localStorage.setItem("yandexCalendarConfig", JSON.stringify(config));
  }

  // Загрузка конфигурации при инициализации
  loadConfig(): YandexCalendarConfig | null {
    const storedConfig = localStorage.getItem("yandexCalendarConfig");
    if (storedConfig) {
      this.config = JSON.parse(storedConfig);
      return this.config;
    }
    return null;
  }

  // Удаление конфигурации
  clearConfig(): void {
    this.config = null;
    localStorage.removeItem("yandexCalendarConfig");
  }

  // Проверка авторизации
  isConfigured(): boolean {
    return this.config !== null;
  }

  // Метод для получения URL авторизации
  getAuthUrl(clientId: string, redirectUri: string): string {
    const scopes = encodeURIComponent("calendar:read calendar:write");
    return `https://oauth.yandex.ru/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
  }

  // Получение событий из Яндекс Календаря
  async fetchEvents(startDate: Date, endDate: Date): Promise<Event[]> {
    if (!this.config) {
      throw new Error(
        "Необходимо сначала настроить интеграцию с Яндекс Календарем"
      );
    }

    try {
      const response = await axios.get(
        `${YandexCalendarService.API_BASE_URL}/calendars/${this.config.calendarId}/events`,
        {
          headers: {
            Authorization: `OAuth ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }
      );

      // Преобразуем события Яндекс Календаря в формат нашего приложения
      return this.mapYandexEventsToAppEvents(response.data.items);
    } catch (error) {
      console.error("Ошибка при получении событий из Яндекс Календаря:", error);
      throw error;
    }
  }

  // Преобразование событий из формата Яндекс Календаря в формат приложения
  private mapYandexEventsToAppEvents(
    yandexEvents: YandexCalendarEvent[]
  ): Event[] {
    return yandexEvents.map((yEvent, index) => {
      const startDate = new Date(yEvent.start.dateTime);

      return {
        id: Date.now() + index, // Генерируем временный ID
        title: yEvent.summary,
        type: "Яндекс Календарь",
        date: startDate.toISOString().split("T")[0],
        time: startDate.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        icon: "fas fa-calendar-alt",
        colorClass: "bg-yellow-100 text-yellow-800",
        externalId: yEvent.id,
        description: yEvent.description || "",
        location: yEvent.location || "",
      };
    });
  }

  // Синхронизация событий из Яндекс Календаря в наше приложение
  async syncEvents(startDate: Date, endDate: Date): Promise<Event[]> {
    const events = await this.fetchEvents(startDate, endDate);

    // Здесь можно добавить логику сохранения событий через eventService
    // Например: await Promise.all(events.map(event => eventService.create(event)));

    return events;
  }
}

export default new YandexCalendarService();
