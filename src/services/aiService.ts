import apiClient, {
  checkApiConnection,
  getLocalData,
  saveLocalData,
} from "./api";
import { Task } from "./taskService";
import { Event } from "./eventService";

export interface AiRecommendation {
  id: number;
  userId: number;
  text: string;
  type: "study" | "productivity" | "schedule" | "general";
  createdAt: string;
  applied: boolean;
  taskId?: number;
  eventId?: number;
  relatedSubject?: string;
}

export interface ChatMessage {
  id: number;
  userId: number;
  text: string;
  isUser: boolean;
  createdAt: string;
  sessionId: string;
}

const LOCAL_STORAGE_RECOMMENDATIONS_KEY =
  "intellect_planner_ai_recommendations";
const LOCAL_STORAGE_CHAT_KEY = "intellect_planner_ai_chat";

class AiService {
  private useLocalStorage = false;
  private recommendationNextId = 1;
  private messageNextId = 1;

  constructor() {
    this.checkConnection();
    this.initNextIds();
  }

  private async checkConnection() {
    this.useLocalStorage = !(await checkApiConnection());
    return this.useLocalStorage;
  }

  private initNextIds() {
    // Инициализация ID для рекомендаций
    const recommendations = getLocalData<AiRecommendation[]>(
      LOCAL_STORAGE_RECOMMENDATIONS_KEY,
      []
    );
    if (recommendations.length > 0) {
      this.recommendationNextId =
        Math.max(...recommendations.map((r) => r.id)) + 1;
    }

    // Инициализация ID для сообщений
    const messages = getLocalData<ChatMessage[]>(LOCAL_STORAGE_CHAT_KEY, []);
    if (messages.length > 0) {
      this.messageNextId = Math.max(...messages.map((m) => m.id)) + 1;
    }
  }

  // РЕКОМЕНДАЦИИ
  async getRecommendations(userId: number): Promise<AiRecommendation[]> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const recommendations = getLocalData<AiRecommendation[]>(
        LOCAL_STORAGE_RECOMMENDATIONS_KEY,
        []
      );
      return recommendations.filter((r) => r.userId === userId);
    }

    try {
      const response = await apiClient.get(
        `/ai/recommendations?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении рекомендаций из API:", error);
      const recommendations = getLocalData<AiRecommendation[]>(
        LOCAL_STORAGE_RECOMMENDATIONS_KEY,
        []
      );
      return recommendations.filter((r) => r.userId === userId);
    }
  }

  async createRecommendation(
    recommendation: Omit<AiRecommendation, "id" | "createdAt">
  ): Promise<AiRecommendation> {
    await this.checkConnection();

    const newRecommendation = {
      ...recommendation,
      id: this.recommendationNextId++,
      createdAt: new Date().toISOString(),
    };

    if (this.useLocalStorage) {
      const recommendations = getLocalData<AiRecommendation[]>(
        LOCAL_STORAGE_RECOMMENDATIONS_KEY,
        []
      );
      recommendations.push(newRecommendation);
      saveLocalData(LOCAL_STORAGE_RECOMMENDATIONS_KEY, recommendations);
      return newRecommendation;
    }

    try {
      const response = await apiClient.post(
        "/ai/recommendations",
        newRecommendation
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании рекомендации:", error);
      const recommendations = getLocalData<AiRecommendation[]>(
        LOCAL_STORAGE_RECOMMENDATIONS_KEY,
        []
      );
      recommendations.push(newRecommendation);
      saveLocalData(LOCAL_STORAGE_RECOMMENDATIONS_KEY, recommendations);
      return newRecommendation;
    }
  }

  async markRecommendationApplied(id: number): Promise<AiRecommendation> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const recommendations = getLocalData<AiRecommendation[]>(
        LOCAL_STORAGE_RECOMMENDATIONS_KEY,
        []
      );
      const index = recommendations.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error(`Рекомендация с ID ${id} не найдена`);
      }

      recommendations[index].applied = true;
      saveLocalData(LOCAL_STORAGE_RECOMMENDATIONS_KEY, recommendations);
      return recommendations[index];
    }

    try {
      const response = await apiClient.patch(`/ai/recommendations/${id}`, {
        applied: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении рекомендации с ID ${id}:`, error);
      const recommendations = getLocalData<AiRecommendation[]>(
        LOCAL_STORAGE_RECOMMENDATIONS_KEY,
        []
      );
      const index = recommendations.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error(`Рекомендация с ID ${id} не найдена`);
      }

      recommendations[index].applied = true;
      saveLocalData(LOCAL_STORAGE_RECOMMENDATIONS_KEY, recommendations);
      return recommendations[index];
    }
  }

  // ЧАТ
  async getChatMessages(
    userId: number,
    sessionId: string
  ): Promise<ChatMessage[]> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const messages = getLocalData<ChatMessage[]>(LOCAL_STORAGE_CHAT_KEY, []);
      return messages.filter(
        (m) => m.userId === userId && m.sessionId === sessionId
      );
    }

    try {
      const response = await apiClient.get(
        `/ai/chat?userId=${userId}&sessionId=${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении сообщений чата из API:", error);
      const messages = getLocalData<ChatMessage[]>(LOCAL_STORAGE_CHAT_KEY, []);
      return messages.filter(
        (m) => m.userId === userId && m.sessionId === sessionId
      );
    }
  }

  async sendChatMessage(
    message: Omit<ChatMessage, "id" | "createdAt">
  ): Promise<ChatMessage> {
    await this.checkConnection();

    const newMessage = {
      ...message,
      id: this.messageNextId++,
      createdAt: new Date().toISOString(),
    };

    if (this.useLocalStorage) {
      const messages = getLocalData<ChatMessage[]>(LOCAL_STORAGE_CHAT_KEY, []);
      messages.push(newMessage);
      saveLocalData(LOCAL_STORAGE_CHAT_KEY, messages);
      return newMessage;
    }

    try {
      const response = await apiClient.post("/ai/chat", newMessage);
      return response.data;
    } catch (error) {
      console.error("Ошибка при отправке сообщения в чат:", error);
      const messages = getLocalData<ChatMessage[]>(LOCAL_STORAGE_CHAT_KEY, []);
      messages.push(newMessage);
      saveLocalData(LOCAL_STORAGE_CHAT_KEY, messages);
      return newMessage;
    }
  }

  // Получение рекомендаций на основе задач и событий
  async generateRecommendations(
    userId: number,
    tasks: Task[],
    events: Event[]
  ): Promise<AiRecommendation[]> {
    // Здесь может быть логика генерации рекомендаций
    // В демо-версии просто создаем статические рекомендации

    const recommendations: AiRecommendation[] = [];

    // Проверяем просроченные задачи
    const overdueTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return !task.completed && dueDate < today;
    });

    if (overdueTasks.length > 0) {
      const task = overdueTasks[0];
      await this.createRecommendation({
        userId,
        text: `Заняться просроченной задачей "${task.title}" в первую очередь`,
        type: "productivity",
        applied: false,
        taskId: task.id,
      });
    }

    // Проверяем задачи с высоким приоритетом
    const highPriorityTasks = tasks.filter(
      (task) => !task.completed && task.priority === "high"
    );

    if (highPriorityTasks.length > 0) {
      const task = highPriorityTasks[0];
      await this.createRecommendation({
        userId,
        text: `Разбить важную задачу "${task.title}" на подзадачи для более эффективной работы`,
        type: "productivity",
        applied: false,
        taskId: task.id,
      });
    }

    // Проверяем наличие экзаменов
    const examTasks = tasks.filter(
      (task) =>
        !task.completed &&
        (task.title.toLowerCase().includes("экзамен") ||
          task.description?.toLowerCase().includes("экзамен"))
    );

    if (examTasks.length > 0) {
      const examTask = examTasks[0];
      await this.createRecommendation({
        userId,
        text: `Выделить 2 часа сегодня на подготовку к экзамену по ${examTask.category || "предмету"}`,
        type: "study",
        applied: false,
        taskId: examTask.id,
        relatedSubject: examTask.category,
      });
    }

    return this.getRecommendations(userId);
  }

  // Получение ответа на сообщение пользователя
  async getAiResponse(
    userId: number,
    userMessage: string,
    sessionId: string
  ): Promise<string> {
    await this.checkConnection();

    // Сохраняем сообщение пользователя
    await this.sendChatMessage({
      userId,
      text: userMessage,
      isUser: true,
      sessionId,
    });

    // В демо-версии используем простую логику для ответов
    const lowerCaseMsg = userMessage.toLowerCase();
    let response = "";

    // Простая логика ответов
    if (
      lowerCaseMsg.includes("привет") ||
      lowerCaseMsg.includes("здравствуй")
    ) {
      response = "Привет! Чем я могу помочь вам сегодня?";
    } else if (lowerCaseMsg.includes("помоги")) {
      response =
        "Конечно! Я могу помочь с планированием задач, анализом расписания и предложить рекомендации по улучшению вашей продуктивности. Что именно вас интересует?";
    } else if (lowerCaseMsg.includes("что ты умеешь")) {
      response =
        "Я могу помочь вам с планированием задач, анализом расписания, предложить оптимальное время для работы над проектами и дать рекомендации по повышению продуктивности.";
    } else if (lowerCaseMsg.includes("улучшить продуктивность")) {
      response =
        "Для улучшения продуктивности рекомендую: 1) Использовать технику Помодоро - 25 минут работы, 5 минут отдыха; 2) Планировать самые сложные задачи на время пиковой активности мозга (обычно утро); 3) Разбивать большие задачи на маленькие подзадачи; 4) Делать регулярные перерывы для поддержания энергии.";
    } else if (
      lowerCaseMsg.includes("когда") &&
      lowerCaseMsg.includes("учиться")
    ) {
      response =
        "Исследования показывают, что наиболее эффективное время для обучения - утренние часы (с 9 до 12) и вечер (с 16 до 18). Однако это индивидуально и зависит от вашего хронотипа. Попробуйте отслеживать, в какое время вы наиболее продуктивны.";
    } else if (lowerCaseMsg.includes("стресс")) {
      response =
        "Для борьбы со стрессом рекомендую: 1) Регулярные физические нагрузки; 2) Техники медитации и осознанного дыхания; 3) Достаточный сон (7-8 часов); 4) Правильное питание; 5) Планирование времени на отдых; 6) Чередование типов деятельности в течение дня.";
    } else if (lowerCaseMsg.includes("экзамен")) {
      response =
        "Для эффективной подготовки к экзамену: 1) Составьте план и разделите материал на части; 2) Используйте метод активного повторения, а не просто чтения; 3) Объясняйте материал вслух, будто преподаете; 4) Делайте короткие, но регулярные сессии подготовки; 5) Высыпайтесь, особенно перед экзаменом.";
    } else {
      response =
        "Извините, я не совсем понял ваш вопрос. Могли бы вы уточнить, что именно вас интересует в планировании учебной деятельности?";
    }

    // Сохраняем ответ ИИ
    await this.sendChatMessage({
      userId,
      text: response,
      isUser: false,
      sessionId,
    });

    return response;
  }
}

export const aiService = new AiService();
