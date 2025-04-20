import apiClient, {
  checkApiConnection,
  getLocalData,
  saveLocalData,
} from "./api";
import telegramService from "./telegramService";
import type { Task } from "./taskService";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "info" | "warning" | "task" | "calendar" | "system";
  createdAt: string;
  isRead: boolean;
  taskId?: number;
  eventId?: number;
  emailSent?: boolean;
  telegramSent?: boolean;
  relatedTitle?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface EmailNotification {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const LOCAL_STORAGE_KEY = "intellect_planner_notifications";

class NotificationService {
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
    const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
    if (notifications.length > 0) {
      this.nextId = Math.max(...notifications.map((n) => n.id)) + 1;
    }
  }

  async getAll(userId: number): Promise<Notification[]> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      return notifications.filter((n) => n.userId === userId);
    }

    try {
      const response = await apiClient.get(`/notifications?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении уведомлений из API:", error);
      // Если API недоступен, возвращаем данные из localStorage
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      return notifications.filter((n) => n.userId === userId);
    }
  }

  async create(notification: Omit<Notification, "id">): Promise<Notification> {
    await this.checkConnection();

    const newNotification = {
      ...notification,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
    };

    if (this.useLocalStorage) {
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      notifications.push(newNotification);
      saveLocalData(LOCAL_STORAGE_KEY, notifications);
      return newNotification;
    }

    try {
      const response = await apiClient.post("/notifications", newNotification);
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании уведомления:", error);
      // Если API недоступен, сохраняем в localStorage
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      notifications.push(newNotification);
      saveLocalData(LOCAL_STORAGE_KEY, notifications);
      return newNotification;
    }
  }

  async markAsRead(id: number): Promise<Notification> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      const index = notifications.findIndex((n) => n.id === id);
      if (index === -1) throw new Error(`Уведомление с ID ${id} не найдено`);

      notifications[index].isRead = true;
      saveLocalData(LOCAL_STORAGE_KEY, notifications);
      return notifications[index];
    }

    try {
      const response = await apiClient.patch(`/notifications/${id}`, {
        isRead: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении уведомления с ID ${id}:`, error);
      // Если API недоступен, обновляем в localStorage
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      const index = notifications.findIndex((n) => n.id === id);
      if (index === -1) throw new Error(`Уведомление с ID ${id} не найдено`);

      notifications[index].isRead = true;
      saveLocalData(LOCAL_STORAGE_KEY, notifications);
      return notifications[index];
    }
  }

  async delete(id: number): Promise<void> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      let notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      notifications = notifications.filter((n) => n.id !== id);
      saveLocalData(LOCAL_STORAGE_KEY, notifications);
      return;
    }

    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error(`Ошибка при удалении уведомления с ID ${id}:`, error);
      // Если API недоступен, удаляем из localStorage
      let notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      notifications = notifications.filter((n) => n.id !== id);
      saveLocalData(LOCAL_STORAGE_KEY, notifications);
    }
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      const updatedNotifications = notifications.map((n) => {
        if (n.userId === userId && !n.isRead) {
          return { ...n, isRead: true };
        }
        return n;
      });
      saveLocalData(LOCAL_STORAGE_KEY, updatedNotifications);
      return;
    }

    try {
      await apiClient.patch(`/notifications/mark-all/${userId}`, {
        isRead: true,
      });
    } catch (error) {
      console.error(`Ошибка при обновлении всех уведомлений:`, error);
      // Если API недоступен, обновляем в localStorage
      const notifications = getLocalData<Notification[]>(LOCAL_STORAGE_KEY, []);
      const updatedNotifications = notifications.map((n) => {
        if (n.userId === userId && !n.isRead) {
          return { ...n, isRead: true };
        }
        return n;
      });
      saveLocalData(LOCAL_STORAGE_KEY, updatedNotifications);
    }
  }

  async sendEmailNotification(emailData: EmailNotification): Promise<boolean> {
    await this.checkConnection();
    console.log(`Попытка отправки email на адрес: ${emailData.to}`);

    if (this.useLocalStorage) {
      // В режиме локального хранилища просто логируем отправку email
      console.log(
        "Режим локального хранилища, имитация отправки email:",
        emailData
      );
      return true;
    }

    try {
      const response = await apiClient.post("/notifications/email", emailData);
      console.log("Email успешно отправлен:", response.data);
      return true;
    } catch (error) {
      console.error("Ошибка при отправке email-уведомления:", error);

      // Создаем запись о неудачной отправке в уведомлениях
      try {
        // Получаем ID пользователя из адреса
        const user = await apiClient.get(`/user?email=${emailData.to}`);
        if (user && user.data && user.data.id) {
          await this.create({
            userId: user.data.id,
            title: "Ошибка отправки email",
            message: `Не удалось отправить email "${emailData.subject}" на адрес ${emailData.to}. Проверьте настройки почты.`,
            type: "warning",
            isRead: false,
            createdAt: new Date().toISOString(),
            emailSent: false,
          });
        }
      } catch (err) {
        console.error("Не удалось создать уведомление об ошибке email:", err);
      }

      return false;
    }
  }

  // Функция для создания умных напоминаний на основе задач
  async createTaskReminders(
    userId: number,
    email: string,
    tasks: Task[]
  ): Promise<void> {
    console.log(`Создание напоминаний для пользователя ${userId} (${email})`);
    console.log(`Всего задач: ${tasks.length}`);

    // Получаем только даты без времени для сравнения
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const tomorrow = new Date(todayDate);
    tomorrow.setDate(todayDate.getDate() + 1);

    const nextWeek = new Date(todayDate);
    nextWeek.setDate(todayDate.getDate() + 7);

    console.log(`Сегодня: ${todayDate.toISOString().split("T")[0]}`);
    console.log(`Завтра: ${tomorrow.toISOString().split("T")[0]}`);
    console.log(`Через неделю: ${nextWeek.toISOString().split("T")[0]}`);

    // Создаем массивы для разных типов задач
    const tomorrowTasks: Task[] = []; // Задачи на завтра
    const urgentTodayTasks: Task[] = []; // Срочные задачи на сегодня
    const overdueTasks: Task[] = []; // Просроченные задачи
    const importantWeekTasks: Task[] = []; // Важные задачи на неделю
    const lowProgressTasks: (Task & { daysUntilDue: number })[] = []; // Задачи с низким прогрессом и скорым дедлайном

    // Распределяем задачи по категориям
    tasks.forEach((task) => {
      if (task.completed) return;

      const dueDate = new Date(task.dueDate);
      // Преобразуем к началу дня для корректного сравнения
      const taskDate = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate()
      );

      // Задачи на завтра
      if (taskDate.getTime() === tomorrow.getTime()) {
        tomorrowTasks.push(task);
      }

      // Срочные задачи на сегодня
      if (
        task.priority === "high" &&
        taskDate.getTime() === todayDate.getTime()
      ) {
        urgentTodayTasks.push(task);
      }

      // Просроченные задачи
      if (taskDate.getTime() < todayDate.getTime()) {
        overdueTasks.push(task);
      }

      // Важные задачи на неделю
      if (
        task.priority === "high" &&
        taskDate.getTime() > todayDate.getTime() &&
        taskDate.getTime() <= nextWeek.getTime()
      ) {
        importantWeekTasks.push(task);
      }

      // Задачи с низким прогрессом и скорым дедлайном
      const daysUntilDue = Math.floor(
        (taskDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDue <= 3 && daysUntilDue >= 0 && task.progress < 50) {
        lowProgressTasks.push({
          ...task,
          daysUntilDue,
        });
      }
    });

    console.log(`Найдено задач на завтра: ${tomorrowTasks.length}`);
    console.log(`Найдено срочных задач на сегодня: ${urgentTodayTasks.length}`);
    console.log(`Найдено просроченных задач: ${overdueTasks.length}`);
    console.log(`Найдено важных задач на неделю: ${importantWeekTasks.length}`);
    console.log(
      `Найдено задач с низким прогрессом: ${lowProgressTasks.length}`
    );

    // Массив для сбора всех созданных уведомлений, чтобы отправить их в Telegram
    const createdNotifications = [];

    // Проверяем наличие задач для уведомлений
    if (
      tomorrowTasks.length === 0 &&
      urgentTodayTasks.length === 0 &&
      overdueTasks.length === 0 &&
      importantWeekTasks.length === 0 &&
      lowProgressTasks.length === 0
    ) {
      console.log("Нет задач для создания умных напоминаний");
      // Создаем информационное уведомление
      const notification = await this.create({
        userId,
        title: "Нет активных задач для напоминаний",
        message:
          "У вас нет предстоящих задач, требующих внимания. Хороший день для планирования!",
        type: "info",
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      createdNotifications.push(notification);
    }

    // Создаем уведомления для просроченных задач (самый высокий приоритет)
    if (overdueTasks.length > 0) {
      const title = `Просроченные задачи (${overdueTasks.length})`;
      const message = `У вас есть ${overdueTasks.length} просроченных задач, которые требуют немедленного внимания!`;

      const notification = await this.create({
        userId,
        title,
        message,
        type: "warning",
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      createdNotifications.push(notification);

      // Отправляем email о просроченных задачах
      if (email) {
        const taskList = overdueTasks
          .map(
            (task) =>
              `- ${task.title} (Приоритет: ${this.getPriorityText(task.priority)}, срок был: ${task.dueDate})`
          )
          .join("\n");

        await this.sendEmailNotification({
          to: email,
          subject: "⚠️ " + title,
          text: `${message}\n\nСписок просроченных задач:\n${taskList}`,
          html: `
            <h2 style="color:#e53e3e;">⚠️ ${title}</h2>
            <p>${message}</p>
            <h3>Список просроченных задач:</h3>
            <ul>
              ${overdueTasks
                .map(
                  (task) =>
                    `<li><strong>${task.title}</strong> (Приоритет: ${this.getPriorityText(task.priority)}, срок был: ${task.dueDate})</li>`
                )
                .join("")}
            </ul>
          `,
        });
      }
    }

    // Создаем уведомления для срочных задач на сегодня
    if (urgentTodayTasks.length > 0) {
      const title = `Срочные задачи на сегодня (${urgentTodayTasks.length})`;
      const message = `У вас есть ${urgentTodayTasks.length} срочных задач, которые нужно выполнить сегодня!`;

      const notification = await this.create({
        userId,
        title,
        message,
        type: "warning",
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      createdNotifications.push(notification);

      // Отправляем email о срочных задачах
      if (email) {
        const taskList = urgentTodayTasks
          .map(
            (task) => `- ${task.title} (время: ${task.time || "не указано"})`
          )
          .join("\n");

        await this.sendEmailNotification({
          to: email,
          subject: "🔥 " + title,
          text: `${message}\n\nСписок срочных задач:\n${taskList}`,
          html: `
            <h2 style="color:#e53e3e;">🔥 ${title}</h2>
            <p>${message}</p>
            <h3>Список срочных задач:</h3>
            <ul>
              ${urgentTodayTasks
                .map(
                  (task) =>
                    `<li><strong>${task.title}</strong> (время: ${task.time || "не указано"})</li>`
                )
                .join("")}
            </ul>
          `,
        });
      }
    }

    // Создаем уведомления для задач на завтра
    if (tomorrowTasks.length > 0) {
      const title = `Задачи на завтра (${tomorrowTasks.length})`;
      const message = `У вас запланировано ${tomorrowTasks.length} задач на завтра. Не забудьте подготовиться!`;

      const notification = await this.create({
        userId,
        title,
        message,
        type: "task",
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      createdNotifications.push(notification);

      // Отправляем email о задачах на завтра
      if (email) {
        const taskList = tomorrowTasks
          .map(
            (task) =>
              `- ${task.title} (Приоритет: ${this.getPriorityText(task.priority)}, время: ${task.time || "не указано"})`
          )
          .join("\n");

        await this.sendEmailNotification({
          to: email,
          subject: "📅 " + title,
          text: `${message}\n\nСписок задач:\n${taskList}`,
          html: `
            <h2 style="color:#3182ce;">📅 ${title}</h2>
            <p>${message}</p>
            <h3>Список задач:</h3>
            <ul>
              ${tomorrowTasks
                .map(
                  (task) =>
                    `<li><strong>${task.title}</strong> (Приоритет: ${this.getPriorityText(task.priority)}, время: ${task.time || "не указано"})</li>`
                )
                .join("")}
            </ul>
          `,
        });
      }
    }

    // Создаем уведомления для важных задач на неделю
    if (importantWeekTasks.length > 0) {
      const title = `Важные задачи на этой неделе (${importantWeekTasks.length})`;
      const message = `У вас ${importantWeekTasks.length} важных задач, запланированных на ближайшую неделю.`;

      const notification = await this.create({
        userId,
        title,
        message,
        type: "task",
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      createdNotifications.push(notification);

      // Отправляем email о важных задачах на неделю
      if (email) {
        const taskList = importantWeekTasks
          .map((task) => `- ${task.title} (срок: ${task.dueDate})`)
          .join("\n");

        await this.sendEmailNotification({
          to: email,
          subject: "📊 " + title,
          text: `${message}\n\nСписок важных задач на неделю:\n${taskList}`,
          html: `
            <h2 style="color:#805ad5;">📊 ${title}</h2>
            <p>${message}</p>
            <h3>Список важных задач на неделю:</h3>
            <ul>
              ${importantWeekTasks
                .map(
                  (task) =>
                    `<li><strong>${task.title}</strong> (срок: ${task.dueDate})</li>`
                )
                .join("")}
            </ul>
          `,
        });
      }
    }

    // Создаем уведомления для задач с низким прогрессом
    if (lowProgressTasks.length > 0) {
      const title = `Задачи с низким прогрессом (${lowProgressTasks.length})`;
      const message = `У вас ${lowProgressTasks.length} задач с низким прогрессом выполнения, которые скоро должны быть завершены.`;

      const notification = await this.create({
        userId,
        title,
        message,
        type: "warning",
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      createdNotifications.push(notification);

      // Сортируем задачи по близости дедлайна
      lowProgressTasks.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

      // Отправляем email о задачах с низким прогрессом
      if (email) {
        const taskList = lowProgressTasks
          .map(
            (task) =>
              `- ${task.title} (Прогресс: ${task.progress}%, осталось дней: ${task.daysUntilDue})`
          )
          .join("\n");

        await this.sendEmailNotification({
          to: email,
          subject: "⏳ " + title,
          text: `${message}\n\nСписок задач с низким прогрессом:\n${taskList}`,
          html: `
            <h2 style="color:#d69e2e;">⏳ ${title}</h2>
            <p>${message}</p>
            <h3>Список задач с низким прогрессом:</h3>
            <ul>
              ${lowProgressTasks
                .map(
                  (task) =>
                    `<li><strong>${task.title}</strong> (Прогресс: ${task.progress}%, осталось дней: ${task.daysUntilDue})</li>`
                )
                .join("")}
            </ul>
            <p>Рекомендуем уделить внимание этим задачам, чтобы завершить их вовремя.</p>
          `,
        });
      }
    }

    // Отправляем созданные уведомления в Telegram
    if (createdNotifications.length > 0) {
      await this.sendNotificationsToTelegram(userId, createdNotifications);
    }
  }

  // Отправка уведомлений через Telegram
  private async sendNotificationsToTelegram(
    userId: number,
    notifications: Notification[]
  ): Promise<void> {
    try {
      // Проверяем, подключен ли Telegram
      const config = await telegramService.getConfig(userId);
      if (!config || !config.connected) {
        console.log("Telegram не подключен для пользователя", userId);
        return;
      }

      // Фильтруем уведомления по настройкам пользователя
      let filteredNotifications = [...notifications];

      // Если включена опция "только важные", оставляем только приоритетные уведомления
      if (config.settings.important) {
        filteredNotifications = filteredNotifications.filter(
          (notification) =>
            notification.type === "warning" ||
            (notification.type === "task" &&
              notification.title.includes("высок"))
        );
      }

      // Если отключены уведомления о задачах, убираем их
      if (!config.settings.tasks) {
        filteredNotifications = filteredNotifications.filter(
          (notification) => notification.type !== "task"
        );
      }

      // Если отключены уведомления о событиях календаря, убираем их
      if (!config.settings.events) {
        filteredNotifications = filteredNotifications.filter(
          (notification) => notification.type !== "calendar"
        );
      }

      // Отправляем уведомления
      for (const notification of filteredNotifications) {
        await telegramService.sendNotification(
          userId,
          notification.title,
          notification.message,
          notification.type
        );
      }

      console.log(
        `Отправлено ${filteredNotifications.length} уведомлений в Telegram`
      );
    } catch (error) {
      console.error("Ошибка при отправке уведомлений в Telegram:", error);
    }
  }

  private getPriorityText(priority: string): string {
    switch (priority) {
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return "Обычный";
    }
  }
}

export default new NotificationService();
