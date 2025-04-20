import { defineStore } from "pinia";
import { notificationService, taskService } from "@/services";
import type { Notification } from "@/services/notificationService";
import { useAuthStore } from "./auth";

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

export const useNotificationStore = defineStore("notifications", {
  state: (): NotificationState => ({
    notifications: [],
    isLoading: false,
    error: null,
    unreadCount: 0,
  }),

  getters: {
    // Получить только непрочитанные уведомления
    unreadNotifications(state): Notification[] {
      return state.notifications.filter((notification) => !notification.isRead);
    },

    // Получить только прочитанные уведомления
    readNotifications(state): Notification[] {
      return state.notifications.filter((notification) => notification.isRead);
    },

    // Сортировка уведомлений по дате (новые сначала)
    sortedNotifications(state): Notification[] {
      return [...state.notifications].sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    },

    // Получить количество непрочитанных уведомлений
    unreadCount(state): number {
      return state.notifications.filter((notification) => !notification.isRead)
        .length;
    },
  },

  actions: {
    // Загрузить все уведомления текущего пользователя
    async fetchNotifications() {
      const authStore = useAuthStore();

      if (!authStore.isAuthenticated || !authStore.user?.id) {
        return;
      }

      this.isLoading = true;
      try {
        this.notifications = await notificationService.getAll(
          authStore.user.id
        );
        this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
        this.error = null;
      } catch (error: any) {
        this.error = error.message || "Не удалось загрузить уведомления";
        console.error("Ошибка при загрузке уведомлений:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Создать новое уведомление
    async addNotification(notification: Omit<Notification, "id">) {
      this.isLoading = true;
      try {
        const newNotification = await notificationService.create(notification);
        this.notifications.push(newNotification);

        if (!newNotification.isRead) {
          this.unreadCount++;
        }

        this.error = null;
      } catch (error: any) {
        this.error = error.message || "Не удалось создать уведомление";
        console.error("Ошибка при создании уведомления:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Пометить уведомление как прочитанное
    async markAsRead(id: number) {
      this.isLoading = true;
      try {
        const updatedNotification = await notificationService.markAsRead(id);
        const index = this.notifications.findIndex((n) => n.id === id);

        if (index !== -1) {
          this.notifications[index] = updatedNotification;
          if (this.unreadCount > 0) {
            this.unreadCount--;
          }
        }

        this.error = null;
      } catch (error: any) {
        this.error =
          error.message || "Не удалось отметить уведомление как прочитанное";
        console.error("Ошибка при обновлении уведомления:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Пометить все уведомления как прочитанные
    async markAllAsRead() {
      const authStore = useAuthStore();

      if (!authStore.isAuthenticated || !authStore.user?.id) {
        return;
      }

      this.isLoading = true;
      try {
        await notificationService.markAllAsRead(authStore.user.id);

        // Обновляем статус всех уведомлений в хранилище
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));

        this.unreadCount = 0;
        this.error = null;
      } catch (error: any) {
        this.error =
          error.message ||
          "Не удалось отметить все уведомления как прочитанные";
        console.error("Ошибка при обновлении уведомлений:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Удалить уведомление
    async deleteNotification(id: number) {
      this.isLoading = true;
      try {
        await notificationService.delete(id);

        const notification = this.notifications.find((n) => n.id === id);
        if (notification && !notification.isRead && this.unreadCount > 0) {
          this.unreadCount--;
        }

        this.notifications = this.notifications.filter((n) => n.id !== id);
        this.error = null;
      } catch (error: any) {
        this.error = error.message || "Не удалось удалить уведомление";
        console.error("Ошибка при удалении уведомления:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Создать умные напоминания на основе задач пользователя
    async createTaskReminders() {
      const authStore = useAuthStore();

      console.log(
        "Создание умных напоминаний, аутентификация:",
        authStore.isAuthenticated
      );
      console.log("Данные пользователя:", authStore.user);

      if (
        !authStore.isAuthenticated ||
        !authStore.user?.id ||
        !authStore.user.email
      ) {
        console.error(
          "Невозможно создать напоминания: пользователь не аутентифицирован или отсутствует email"
        );
        return;
      }

      this.isLoading = true;
      try {
        console.log("Получение задач...");
        // Получаем все задачи
        const tasks = await taskService.getAll();
        console.log(`Получено ${tasks.length} задач`);

        // Создаем умные напоминания
        console.log("Создание напоминаний...");
        await notificationService.createTaskReminders(
          authStore.user.id,
          authStore.user.email,
          tasks
        );
        console.log("Напоминания созданы");

        // Обновляем список уведомлений
        console.log("Обновление списка уведомлений");
        await this.fetchNotifications();
        console.log("Список уведомлений обновлен");

        this.error = null;
      } catch (error: any) {
        console.error("Ошибка при создании умных напоминаний:", error);
        this.error = error.message || "Не удалось создать напоминания";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
