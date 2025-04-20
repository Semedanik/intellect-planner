<template>
  <div
    v-if="isOpen"
    class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden"
  >
    <div
      class="py-2 px-4 bg-indigo-600 text-white flex justify-between items-center"
    >
      <h3 class="text-sm font-medium">Уведомления</h3>
      <div>
        <button
          v-if="notificationStore.unreadCount > 0"
          @click="markAllAsRead"
          class="text-xs text-white hover:text-indigo-100 mr-2"
          :disabled="notificationStore.isLoading"
        >
          Отметить все как прочитанные
        </button>
      </div>
    </div>

    <div
      v-if="notificationStore.isLoading"
      class="py-8 flex justify-center items-center"
    >
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-indigo-500 text-xl mb-2"></i>
        <p class="text-gray-500 text-sm">{{ loadingMessage }}</p>
      </div>
    </div>

    <div v-else-if="notificationStore.notifications.length === 0" class="py-8">
      <div class="text-center">
        <i class="fas fa-bell-slash text-gray-400 text-2xl mb-2"></i>
        <p class="text-gray-500 text-sm">У вас нет уведомлений</p>
      </div>
    </div>

    <div v-else class="divide-y divide-gray-100 max-h-80 overflow-y-auto">
      <notification-item
        v-for="notification in sortedNotifications"
        :key="notification.id"
        :notification="notification"
        @mark-as-read="markAsRead"
        @delete="deleteNotification"
      />
    </div>

    <div
      v-if="successMessage"
      class="mt-2 p-2 bg-green-100 text-green-600 text-xs text-center"
    >
      {{ successMessage }}
    </div>

    <div
      v-if="errorMessage"
      class="mt-2 p-2 bg-red-100 text-red-600 text-xs text-center"
    >
      {{ errorMessage }}
    </div>

    <div class="py-2 px-4 bg-gray-50 text-center">
      <button
        @click="createTaskReminders"
        class="py-1 px-3 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-xs"
        :disabled="notificationStore.isLoading"
        :class="{
          'opacity-50 cursor-not-allowed': notificationStore.isLoading,
        }"
      >
        <i
          class="fas fa-sync-alt mr-1"
          :class="{ 'fa-spin': creatingReminders }"
        ></i>
        Создать умные напоминания
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useNotificationStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";
import NotificationItem from "@/components/ui/NotificationItem.vue";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const creatingReminders = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const loadingMessage = ref("Загрузка уведомлений...");

// Сортировка уведомлений (непрочитанные сначала, затем по дате)
const sortedNotifications = computed(() => {
  return [...notificationStore.notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1; // Непрочитанные сначала
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // По дате (новые сначала)
  });
});

const clearMessages = () => {
  successMessage.value = "";
  errorMessage.value = "";
};

const markAsRead = async (id: number) => {
  clearMessages();
  await notificationStore.markAsRead(id);
};

const markAllAsRead = async () => {
  clearMessages();
  loadingMessage.value = "Отмечаем уведомления...";
  await notificationStore.markAllAsRead();
};

const deleteNotification = async (id: number) => {
  clearMessages();
  await notificationStore.deleteNotification(id);
};

const createTaskReminders = async () => {
  // Проверяем авторизован ли пользователь
  if (!authStore.isAuthenticated) {
    errorMessage.value = "Для создания напоминаний необходимо авторизоваться";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
    return;
  }

  // Проверяем есть ли email
  if (!authStore.user?.email) {
    errorMessage.value =
      "У вашего профиля отсутствует email для отправки уведомлений";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
    return;
  }

  clearMessages();
  creatingReminders.value = true;
  loadingMessage.value = "Создаем умные напоминания...";

  try {
    await notificationStore.createTaskReminders();
    successMessage.value = "Напоминания успешно созданы!";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Ошибка при создании напоминаний:", error);
    errorMessage.value = "Не удалось создать напоминания";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  } finally {
    creatingReminders.value = false;
    loadingMessage.value = "Загрузка уведомлений...";
  }
};
</script>
