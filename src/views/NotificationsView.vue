<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Шапка страницы -->
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"
      >
        <h1 class="text-2xl font-bold text-gray-900">Уведомления</h1>

        <div class="flex items-center space-x-4">
          <button
            @click="markAllAsRead"
            v-if="unreadCount > 0"
            class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            :disabled="notificationStore.isLoading"
          >
            Отметить все как прочитанные
          </button>

          <button
            @click="createTaskReminders"
            class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
            :disabled="notificationStore.isLoading || creatingReminders"
          >
            <i
              class="fas fa-sync-alt mr-1"
              :class="{ 'fa-spin': creatingReminders }"
            ></i>
            Создать умные напоминания
          </button>
        </div>
      </div>
    </header>

    <!-- Основной контент страницы -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Статус загрузки -->
      <div v-if="notificationStore.isLoading" class="flex justify-center py-12">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin text-indigo-500 text-3xl mb-3"></i>
          <p class="text-gray-500">{{ loadingMessage }}</p>
        </div>
      </div>

      <!-- Сообщения об успехе/ошибке -->
      <div
        v-if="successMessage"
        class="mb-4 p-4 bg-green-100 text-green-700 rounded-md"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="errorMessage"
        class="mb-4 p-4 bg-red-100 text-red-700 rounded-md"
      >
        {{ errorMessage }}
      </div>

      <!-- Пустое состояние -->
      <div
        v-if="!notificationStore.isLoading && notifications.length === 0"
        class="bg-white shadow rounded-lg p-8 text-center"
      >
        <i class="fas fa-bell-slash text-gray-400 text-4xl mb-4"></i>
        <h2 class="text-xl font-medium text-gray-700 mb-2">
          У вас нет уведомлений
        </h2>
        <p class="text-gray-500 mb-4">
          Когда появятся уведомления, вы увидите их здесь
        </p>
        <button
          @click="createTaskReminders"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          :disabled="creatingReminders"
        >
          <i class="fas fa-magic mr-2"></i>
          Создать умные напоминания
        </button>
      </div>

      <!-- Список уведомлений -->
      <div
        v-else-if="!notificationStore.isLoading"
        class="bg-white shadow rounded-lg overflow-hidden"
      >
        <!-- Фильтр уведомлений -->
        <div class="p-4 border-b border-gray-200 flex flex-wrap gap-2">
          <button
            @click="filterType = 'all'"
            :class="[
              'px-3 py-1 rounded-md text-sm',
              filterType === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <i class="fas fa-list-ul mr-1"></i> Все
          </button>
          <button
            @click="filterType = 'unread'"
            :class="[
              'px-3 py-1 rounded-md text-sm',
              filterType === 'unread'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <i class="fas fa-envelope mr-1"></i> Непрочитанные
          </button>
          <button
            @click="filterType = 'task'"
            :class="[
              'px-3 py-1 rounded-md text-sm',
              filterType === 'task'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <i class="fas fa-tasks mr-1"></i> Задачи
          </button>
          <button
            @click="filterType = 'warning'"
            :class="[
              'px-3 py-1 rounded-md text-sm',
              filterType === 'warning'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <i class="fas fa-exclamation-triangle mr-1"></i> Предупреждения
          </button>
          <button
            @click="filterType = 'calendar'"
            :class="[
              'px-3 py-1 rounded-md text-sm',
              filterType === 'calendar'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <i class="fas fa-calendar-alt mr-1"></i> Календарь
          </button>
          <button
            @click="filterType = 'info'"
            :class="[
              'px-3 py-1 rounded-md text-sm',
              filterType === 'info'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <i class="fas fa-info-circle mr-1"></i> Информация
          </button>
        </div>

        <!-- Инструменты сортировки -->
        <div
          class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center"
        >
          <div class="text-sm text-gray-500">
            {{ filteredNotifications.length }} уведомлений
          </div>
          <div class="flex items-center">
            <span class="text-sm text-gray-500 mr-2">Сортировка:</span>
            <select
              v-model="sortOrder"
              class="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="unread">Сначала непрочитанные</option>
            </select>
          </div>
        </div>

        <!-- Список уведомлений -->
        <div class="divide-y divide-gray-100">
          <template v-if="filteredNotifications.length === 0">
            <div class="p-8 text-center">
              <i class="fas fa-filter text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500">
                Нет уведомлений, соответствующих выбранному фильтру
              </p>
            </div>
          </template>
          <notification-item
            v-else
            v-for="notification in sortedAndFilteredNotifications"
            :key="notification.id"
            :notification="notification"
            :detailed="true"
            @mark-as-read="markAsRead"
            @delete="deleteNotification"
          />
        </div>

        <!-- Пагинация (если уведомлений много) -->
        <div
          v-if="filteredNotifications.length > pageSize"
          class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
        >
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              ]"
            >
              Назад
            </button>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md',
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              ]"
            >
              Вперед
            </button>
          </div>
          <div
            class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm text-gray-700">
                Показано <span class="font-medium">{{ startPage }}</span> по
                <span class="font-medium">{{ endPage }}</span> из
                <span class="font-medium">{{
                  filteredNotifications.length
                }}</span>
                уведомлений
              </p>
            </div>
            <div>
              <nav
                class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Предыдущая</span>
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    currentPage === page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Следующая</span>
                  <i class="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Настройка Telegram-уведомлений -->
      <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div
          class="p-4 border-b border-gray-200 flex justify-between items-center"
        >
          <h2 class="text-lg font-medium text-gray-900">
            Настройка уведомлений
          </h2>
        </div>

        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Блок настройки Email-уведомлений -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-md font-medium text-gray-900">
                Уведомления по Email
              </h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  emailEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ emailEnabled ? "Включено" : "Отключено" }}
              </span>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-700 mb-2">
                Получайте уведомления о задачах и событиях на вашу электронную
                почту
              </p>

              <div class="mt-2">
                <div class="flex items-center justify-between mb-2">
                  <label
                    for="email"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Email для уведомлений
                  </label>
                </div>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    :value="userEmail"
                    :disabled="true"
                    class="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50"
                    placeholder="example@example.com"
                  />
                  <button
                    @click="navigateToProfile"
                    class="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <i class="fas fa-edit mr-1"></i>
                    Изменить
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Email берется из вашего профиля. Для изменения перейдите в
                  профиль.
                </p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-md p-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Настройки уведомлений
              </h4>
              <div class="space-y-2">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="emailTasks"
                    v-model="emailSettings.tasks"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="emailTasks" class="ml-2 text-sm text-gray-700">
                    Уведомления о задачах
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="emailEvents"
                    v-model="emailSettings.events"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="emailEvents" class="ml-2 text-sm text-gray-700">
                    Уведомления о событиях
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="emailDaily"
                    v-model="emailSettings.dailyDigest"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label for="emailDaily" class="ml-2 text-sm text-gray-700">
                    Ежедневная сводка
                  </label>
                </div>
              </div>
              <button
                @click="saveEmailSettings"
                class="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                :disabled="savingEmailSettings"
              >
                <i
                  v-if="savingEmailSettings"
                  class="fas fa-spinner fa-spin mr-2"
                ></i>
                Сохранить настройки
              </button>
            </div>

            <div class="mt-4 text-center">
              <button
                @click="sendTestEmail"
                class="text-sm text-indigo-600 hover:text-indigo-800"
                :disabled="sendingTestEmail"
              >
                <i
                  v-if="sendingTestEmail"
                  class="fas fa-spinner fa-spin mr-1"
                ></i>
                <i v-else class="fas fa-paper-plane mr-1"></i>
                Отправить тестовое сообщение
              </button>
            </div>
          </div>

          <!-- Блок настройки Telegram-уведомлений -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-md font-medium text-gray-900">
                Уведомления в Telegram
              </h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  isTelegramConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ isTelegramConnected ? "Подключено" : "Не подключено" }}
              </span>
            </div>

            <div v-if="!isTelegramConnected" class="mb-4">
              <p class="text-sm text-gray-700 mb-2">
                Получайте уведомления о задачах и событиях через нашего
                Telegram-бота
              </p>

              <div class="flex flex-col sm:flex-row sm:items-center mb-4">
                <div class="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
                  <div
                    class="flex items-center bg-gray-100 rounded-md px-3 py-2"
                  >
                    <span class="block w-full">{{ telegramBotLink }}</span>
                    <button
                      @click="copyBotLink"
                      class="ml-2 text-indigo-600 hover:text-indigo-800"
                      title="Копировать ссылку"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
                <button
                  @click="openTelegramBot"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                >
                  <i class="fab fa-telegram-plane mr-2"></i>
                  Открыть бота
                </button>
              </div>

              <div class="mt-4">
                <label
                  for="telegramToken"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ваш код подтверждения
                </label>
                <div class="flex">
                  <input
                    type="text"
                    id="telegramToken"
                    v-model="telegramToken"
                    placeholder="Например: 123456"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    @click="connectTelegram"
                    class="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    :disabled="!telegramToken || connectingTelegram"
                  >
                    <i
                      v-if="connectingTelegram"
                      class="fas fa-spinner fa-spin mr-2"
                    ></i>
                    Подключить
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Откройте бота и введите команду /start, затем скопируйте
                  полученный код подтверждения
                </p>
              </div>
            </div>

            <div v-else class="mb-4">
              <p class="text-sm text-gray-700 mb-2">
                Ваш Telegram-аккаунт подключен
              </p>
              <div class="flex items-center mb-4">
                <span
                  class="text-sm text-gray-600 bg-gray-100 rounded-md px-3 py-2 flex-1"
                >
                  {{ telegramUsername }}
                </span>
                <button
                  @click="disconnectTelegram"
                  class="ml-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Отключить
                </button>
              </div>

              <div class="bg-gray-50 rounded-md p-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">
                  Настройки уведомлений
                </h4>
                <div class="space-y-2">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyTasks"
                      v-model="telegramSettings.tasks"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label for="notifyTasks" class="ml-2 text-sm text-gray-700">
                      Уведомления о задачах
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyEvents"
                      v-model="telegramSettings.events"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      for="notifyEvents"
                      class="ml-2 text-sm text-gray-700"
                    >
                      Уведомления о событиях
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyImportant"
                      v-model="telegramSettings.important"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      for="notifyImportant"
                      class="ml-2 text-sm text-gray-700"
                    >
                      Только важные уведомления
                    </label>
                  </div>
                </div>
                <button
                  @click="saveTelegramSettings"
                  class="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  :disabled="savingSettings"
                >
                  <i
                    v-if="savingSettings"
                    class="fas fa-spinner fa-spin mr-2"
                  ></i>
                  Сохранить настройки
                </button>
              </div>

              <div class="mt-4 text-center">
                <button
                  @click="sendTestTelegram"
                  class="text-sm text-indigo-600 hover:text-indigo-800"
                  :disabled="sendingTestTelegram"
                >
                  <i
                    v-if="sendingTestTelegram"
                    class="fas fa-spinner fa-spin mr-1"
                  ></i>
                  <i v-else class="fab fa-telegram-plane mr-1"></i>
                  Отправить тестовое сообщение
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useNotificationStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { telegramService } from "@/services";
import type { TelegramConfig } from "@/services/telegramService";
import NotificationItem from "@/components/ui/NotificationItem.vue";

const router = useRouter();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

// Переменные для фильтрации и сортировки
const filterType = ref<string>("all");
const sortOrder = ref<string>("newest");
const pageSize = ref<number>(5);
const currentPage = ref<number>(1);

// Переменные для уведомлений
const creatingReminders = ref<boolean>(false);
const successMessage = ref<string>("");
const errorMessage = ref<string>("");
const loadingMessage = ref<string>("");

// Переменные для Email-уведомлений
const emailEnabled = ref<boolean>(true);
const userEmail = ref<string>("");
const savingEmailSettings = ref<boolean>(false);
const sendingTestEmail = ref<boolean>(false);
const emailSettings = ref({
  tasks: true,
  events: true,
  dailyDigest: false,
});

// Переменные для Telegram-уведомлений
const telegramBotLink = ref<string>("https://t.me/IntellectPlannerBot");
const telegramToken = ref<string>("");
const isTelegramConnected = ref<boolean>(false);
const telegramUsername = ref<string>("");
const connectingTelegram = ref<boolean>(false);
const savingSettings = ref<boolean>(false);
const sendingTestTelegram = ref<boolean>(false);
const telegramSettings = ref({
  tasks: true,
  events: true,
  important: false,
});

// Проверяем авторизацию и загружаем данные
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    // Перенаправляем на домашнюю страницу
    router.push("/");
    return;
  }

  // Загружаем уведомления
  await notificationStore.fetchNotifications();

  // Загружаем конфигурацию Telegram
  await loadTelegramConfig();

  // Загрузка данных email
  try {
    const authData = await authStore.getUserData();
    if (authData && authData.email) {
      userEmail.value = authData.email;
      emailEnabled.value = true;
    }

    const settings = await notificationStore.getEmailSettings();
    if (settings) {
      emailSettings.value = settings;
    }
  } catch (error) {
    console.error("Ошибка загрузки данных email", error);
  }

  // Проверка подключения Telegram
  try {
    isTelegramConnected.value = await notificationStore.isTelegramConnected();
    if (isTelegramConnected.value) {
      telegramUsername.value = await notificationStore.getTelegramUsername();
      const settings = await notificationStore.getTelegramSettings();
      if (settings) {
        telegramSettings.value = settings;
      }
    }
  } catch (error) {
    console.error("Ошибка проверки подключения Telegram", error);
  }
});

// Загрузка конфигурации Telegram
const loadTelegramConfig = async () => {
  if (!authStore.user?.id) return;

  try {
    const config = await telegramService.getConfig(authStore.user.id);

    if (config && config.connected) {
      isTelegramConnected.value = true;
      telegramUsername.value = config.username;
      telegramSettings.value = { ...config.settings };
    } else {
      isTelegramConnected.value = false;
      telegramUsername.value = "";
    }
  } catch (error) {
    console.error("Ошибка при загрузке конфигурации Telegram:", error);
  }
};

// Получаем список уведомлений
const notifications = computed<Notification[]>(() => {
  return notificationStore.notifications;
});

// Фильтруем уведомления
const filteredNotifications = computed(() => {
  // Все уведомления
  let filtered = [...notifications.value];

  // Сначала фильтруем по типу
  if (filterType.value === "unread") {
    filtered = filtered.filter((n) => !n.isRead);
  } else if (filterType.value !== "all") {
    filtered = filtered.filter((n) => n.type === filterType.value);
  }

  return filtered;
});

// Сортируем отфильтрованные уведомления
const sortedAndFilteredNotifications = computed(() => {
  // Клонируем массив, чтобы не мутировать источник
  let sorted = [...filteredNotifications.value];

  // Применяем сортировку
  if (sortOrder.value === "newest") {
    sorted = sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortOrder.value === "oldest") {
    sorted = sorted.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else if (sortOrder.value === "unread") {
    sorted = sorted.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // Применяем пагинацию
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sorted.slice(start, end);
});

// Вычисляем общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / pageSize.value) || 1;
});

// Вычисляем начальный и конечный индексы элементов на текущей странице
const startPage = computed(() => {
  return Math.min(
    (currentPage.value - 1) * pageSize.value + 1,
    filteredNotifications.value.length
  );
});

const endPage = computed(() => {
  return Math.min(
    currentPage.value * pageSize.value,
    filteredNotifications.value.length
  );
});

// Отслеживаем изменения фильтра, чтобы сбросить страницу
watch(filterType, () => {
  currentPage.value = 1;
});

// Количество непрочитанных уведомлений
const unreadCount = computed(() => {
  return notificationStore.unreadCount;
});

// Отметить уведомление как прочитанное
const markAsRead = async (id: number) => {
  clearMessages();
  await notificationStore.markAsRead(id);
};

// Отметить все уведомления как прочитанные
const markAllAsRead = async () => {
  clearMessages();
  loadingMessage.value = "Отмечаем уведомления...";
  try {
    await notificationStore.markAllAsRead();
    successMessage.value = "Все уведомления отмечены как прочитанные";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = "Не удалось отметить уведомления как прочитанные";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};

// Удалить уведомление
const deleteNotification = async (id: number) => {
  clearMessages();
  await notificationStore.deleteNotification(id);
};

// Создать умные напоминания
const createTaskReminders = async () => {
  // Проверяем авторизован ли пользователь
  if (!authStore.isAuthenticated) {
    errorMessage.value = "Для создания напоминаний необходимо авторизоваться";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
    return;
  }

  // Проверяем есть ли email
  if (!authStore.user?.email) {
    errorMessage.value =
      "У вашего профиля отсутствует email для отправки уведомлений";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
    return;
  }

  clearMessages();
  creatingReminders.value = true;
  loadingMessage.value = "Создаем умные напоминания...";

  try {
    await notificationStore.createTaskReminders();

    // Если Telegram подключен, отправляем тестовое уведомление
    if (isTelegramConnected.value && authStore.user?.id) {
      await telegramService.sendNotification(
        authStore.user.id,
        "Умные напоминания созданы",
        "Ваши напоминания о задачах были успешно созданы и готовы к отправке."
      );
    }

    successMessage.value = "Напоминания успешно созданы!";
    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (error) {
    console.error("Ошибка при создании напоминаний:", error);
    errorMessage.value = "Не удалось создать напоминания";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
  } finally {
    creatingReminders.value = false;
    loadingMessage.value = "Загрузка уведомлений...";
  }
};

// Email функции
const navigateToProfile = () => {
  router.push({ name: "profile" });
};

const saveEmailSettings = async () => {
  try {
    savingEmailSettings.value = true;
    await notificationStore.updateEmailSettings(emailSettings.value);
    successMessage.value = "Настройки email успешно сохранены";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = "Не удалось сохранить настройки email";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  } finally {
    savingEmailSettings.value = false;
  }
};

const sendTestEmail = async () => {
  try {
    sendingTestEmail.value = true;
    await notificationStore.sendTestEmail(userEmail.value);
    successMessage.value = "Тестовое сообщение отправлено на ваш email";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = "Не удалось отправить тестовое сообщение";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  } finally {
    sendingTestEmail.value = false;
  }
};

// Telegram функции
const copyBotLink = () => {
  navigator.clipboard.writeText(telegramBotLink.value);
  successMessage.value = "Ссылка скопирована в буфер обмена";
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

const openTelegramBot = () => {
  window.open(telegramBotLink.value, "_blank");
};

const connectTelegram = async () => {
  if (!telegramToken.value) return;

  try {
    connectingTelegram.value = true;
    await notificationStore.connectTelegram(telegramToken.value);
    isTelegramConnected.value = true;
    telegramUsername.value = await notificationStore.getTelegramUsername();
    successMessage.value = "Telegram успешно подключен";
    telegramToken.value = "";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value =
      "Не удалось подключить Telegram. Проверьте код подтверждения";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  } finally {
    connectingTelegram.value = false;
  }
};

const disconnectTelegram = async () => {
  try {
    await notificationStore.disconnectTelegram();
    isTelegramConnected.value = false;
    successMessage.value = "Telegram отключен";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = "Не удалось отключить Telegram";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};

const saveTelegramSettings = async () => {
  try {
    savingSettings.value = true;
    await notificationStore.updateTelegramSettings(telegramSettings.value);
    successMessage.value = "Настройки Telegram успешно сохранены";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = "Не удалось сохранить настройки Telegram";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  } finally {
    savingSettings.value = false;
  }
};

const sendTestTelegram = async () => {
  try {
    sendingTestTelegram.value = true;
    await notificationStore.sendTestTelegram();
    successMessage.value = "Тестовое сообщение отправлено в Telegram";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = "Не удалось отправить тестовое сообщение в Telegram";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  } finally {
    sendingTestTelegram.value = false;
  }
};

// Очистить сообщения
const clearMessages = () => {
  successMessage.value = "";
  errorMessage.value = "";
};
</script>
