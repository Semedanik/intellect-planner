<template>
  <div
    :class="[
      'p-4 hover:bg-gray-50 transition-colors flex items-start',
      { 'bg-indigo-50': !notification.isRead },
    ]"
  >
    <div :class="iconClass">
      <i :class="iconName"></i>
    </div>
    <div class="ml-3 flex-1">
      <div class="flex items-start justify-between">
        <p class="text-sm font-medium text-gray-900">
          {{ notification.title }}
        </p>
        <div class="ml-2 flex-shrink-0 flex">
          <button
            v-if="!notification.isRead"
            @click="$emit('mark-as-read', notification.id)"
            class="p-1 rounded-full text-indigo-600 hover:bg-indigo-100"
            title="Отметить как прочитанное"
          >
            <i class="fas fa-check text-xs"></i>
          </button>
          <button
            @click="$emit('delete', notification.id)"
            class="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            title="Удалить"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
      <p class="mt-1 text-sm text-gray-600">{{ notification.message }}</p>

      <!-- Дополнительная информация для детального представления -->
      <div v-if="detailed" class="mt-2 space-y-2">
        <!-- Связанная задача или событие -->
        <div
          v-if="notification.taskId || notification.eventId"
          class="bg-white border border-gray-200 rounded-md p-2 shadow-sm"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 mr-2">
              <i
                :class="[
                  notification.taskId
                    ? 'fas fa-tasks text-indigo-500'
                    : 'fas fa-calendar-alt text-green-500',
                ]"
              ></i>
            </div>
            <div class="flex-1">
              <p class="text-xs font-medium">
                {{
                  notification.taskId ? "Связанная задача" : "Связанное событие"
                }}
              </p>
              <p class="text-xs text-gray-600">
                {{ notification.relatedTitle || "Нет названия" }}
              </p>
            </div>
            <a
              :href="getRelatedItemLink"
              class="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
            >
              {{
                notification.taskId ? "Перейти к задаче" : "Перейти к событию"
              }}
            </a>
          </div>
        </div>

        <!-- Информация о доставке уведомлений -->
        <div
          v-if="notification.emailSent || notification.telegramSent"
          class="flex flex-wrap gap-2"
        >
          <div
            v-if="notification.emailSent"
            class="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs flex items-center"
          >
            <i class="fas fa-envelope mr-1"></i>
            Отправлено на email
          </div>
          <div
            v-if="notification.telegramSent"
            class="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center"
          >
            <i class="fab fa-telegram-plane mr-1"></i>
            Отправлено в Telegram
          </div>
        </div>

        <!-- Дополнительные метаданные -->
        <div
          v-if="notification.metadata"
          class="text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200"
        >
          <div
            v-for="(value, key) in notification.metadata"
            :key="key"
            class="flex justify-between"
          >
            <span class="font-medium">{{ formatMetadataKey(key) }}:</span>
            <span>{{ formatMetadataValue(key, value) }}</span>
          </div>
        </div>
      </div>

      <p class="mt-1 text-xs text-gray-500">{{ formattedDate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Notification } from "@/services/notificationService";

const props = defineProps({
  notification: {
    type: Object as () => Notification,
    required: true,
  },
  detailed: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["mark-as-read", "delete"]);

// Форматирование даты уведомления
const formattedDate = computed(() => {
  const date = new Date(props.notification.createdAt);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Определение иконки в зависимости от типа уведомления
const iconName = computed(() => {
  switch (props.notification.type) {
    case "info":
      return "fas fa-info-circle";
    case "warning":
      return "fas fa-exclamation-triangle";
    case "task":
      return "fas fa-tasks";
    case "calendar":
      return "fas fa-calendar-alt";
    case "system":
      return "fas fa-cog";
    default:
      return "fas fa-bell";
  }
});

// Определение цвета иконки в зависимости от типа уведомления
const iconClass = computed(() => {
  switch (props.notification.type) {
    case "info":
      return "flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center";
    case "warning":
      return "flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center";
    case "task":
      return "flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center";
    case "calendar":
      return "flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center";
    case "system":
      return "flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center";
    default:
      return "flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center";
  }
});

// Получить ссылку на связанный элемент
const getRelatedItemLink = computed(() => {
  if (props.notification.taskId) {
    return `/tasks/${props.notification.taskId}`;
  }
  if (props.notification.eventId) {
    return `/calendar?event=${props.notification.eventId}`;
  }
  return "#";
});

// Форматирование ключей метаданных
const formatMetadataKey = (key: string): string => {
  const formatted = key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
  return formatted;
};

// Форматирование значений метаданных
const formatMetadataValue = (
  key: string,
  value: string | number | boolean
): string => {
  if (key.includes("date") || key.includes("Date")) {
    try {
      const date = new Date(String(value));
      return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(value);
    }
  }

  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }

  return String(value);
};
</script>
