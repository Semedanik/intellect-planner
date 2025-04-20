import apiClient, {
  checkApiConnection,
  getLocalData,
  saveLocalData,
} from "./api";

export interface TelegramConfig {
  userId: number;
  chatId: string;
  username: string;
  connected: boolean;
  settings: {
    tasks: boolean;
    events: boolean;
    important: boolean;
  };
}

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "Markdown";
}

const LOCAL_STORAGE_KEY = "intellect_planner_telegram";

class TelegramService {
  private useLocalStorage = false;

  constructor() {
    this.checkConnection();
  }

  private async checkConnection() {
    this.useLocalStorage = !(await checkApiConnection());
    return this.useLocalStorage;
  }

  async getConfig(userId: number): Promise<TelegramConfig | null> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const configs = getLocalData<TelegramConfig[]>(LOCAL_STORAGE_KEY, []);
      return configs.find((c) => c.userId === userId) || null;
    }

    try {
      const response = await apiClient.get(`/telegram/config/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении конфигурации Telegram:", error);
      // Если API недоступен или конфигурации не существует
      const configs = getLocalData<TelegramConfig[]>(LOCAL_STORAGE_KEY, []);
      return configs.find((c) => c.userId === userId) || null;
    }
  }

  async connectTelegram(
    userId: number,
    token: string
  ): Promise<TelegramConfig> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      // В демо-режиме мы просто создаем фиктивную конфигурацию
      const newConfig: TelegramConfig = {
        userId,
        chatId: Math.floor(Math.random() * 1000000000).toString(),
        username: "@user" + Math.floor(Math.random() * 10000),
        connected: true,
        settings: {
          tasks: true,
          events: true,
          important: false,
        },
      };

      const configs = getLocalData<TelegramConfig[]>(LOCAL_STORAGE_KEY, []);
      const existingIndex = configs.findIndex((c) => c.userId === userId);

      if (existingIndex !== -1) {
        configs[existingIndex] = newConfig;
      } else {
        configs.push(newConfig);
      }

      saveLocalData(LOCAL_STORAGE_KEY, configs);
      return newConfig;
    }

    try {
      const response = await apiClient.post("/telegram/connect", {
        userId,
        token,
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при подключении Telegram:", error);
      throw new Error(
        "Не удалось подключить Telegram. Проверьте код и попробуйте снова."
      );
    }
  }

  async disconnectTelegram(userId: number): Promise<void> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const configs = getLocalData<TelegramConfig[]>(LOCAL_STORAGE_KEY, []);
      const newConfigs = configs.filter((c) => c.userId !== userId);
      saveLocalData(LOCAL_STORAGE_KEY, newConfigs);
      return;
    }

    try {
      await apiClient.post("/telegram/disconnect", { userId });
    } catch (error) {
      console.error("Ошибка при отключении Telegram:", error);
      throw new Error("Не удалось отключить Telegram");
    }
  }

  async updateSettings(
    userId: number,
    settings: TelegramConfig["settings"]
  ): Promise<TelegramConfig> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const configs = getLocalData<TelegramConfig[]>(LOCAL_STORAGE_KEY, []);
      const existingIndex = configs.findIndex((c) => c.userId === userId);

      if (existingIndex === -1) {
        throw new Error("Конфигурация Telegram не найдена");
      }

      const updatedConfig = {
        ...configs[existingIndex],
        settings,
      };

      configs[existingIndex] = updatedConfig;
      saveLocalData(LOCAL_STORAGE_KEY, configs);
      return updatedConfig;
    }

    try {
      const response = await apiClient.patch(`/telegram/settings/${userId}`, {
        settings,
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении настроек Telegram:", error);
      throw new Error("Не удалось обновить настройки Telegram");
    }
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      // В демо-режиме мы просто имитируем отправку сообщения
      console.log("Отправка сообщения в Telegram:", message);
      return true;
    }

    try {
      const response = await apiClient.post("/telegram/send", message);
      return response.data.success;
    } catch (error) {
      console.error("Ошибка при отправке сообщения в Telegram:", error);
      return false;
    }
  }

  async sendNotification(
    userId: number,
    title: string,
    message: string,
    type?: string
  ): Promise<boolean> {
    await this.checkConnection();

    // Получаем конфигурацию Telegram для пользователя
    const config = await this.getConfig(userId);

    if (!config || !config.connected) {
      console.log("Telegram не подключен для пользователя:", userId);
      return false;
    }

    // Проверяем настройки типа уведомлений
    if (type === "task" && !config.settings.tasks) {
      console.log("Уведомления о задачах отключены для пользователя:", userId);
      return false;
    }

    if (type === "calendar" && !config.settings.events) {
      console.log("Уведомления о событиях отключены для пользователя:", userId);
      return false;
    }

    // Форматируем сообщение
    const formattedMessage = `<b>${title}</b>\n\n${message}`;

    // Отправляем сообщение
    return this.sendMessage({
      chatId: config.chatId,
      text: formattedMessage,
      parseMode: "HTML",
    });
  }
}

export default new TelegramService();
