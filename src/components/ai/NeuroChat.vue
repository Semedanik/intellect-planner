<template>
  <div>
    <!-- Кнопка вызова чата -->
    <button
      @click="toggleChat"
      class="fixed right-6 bottom-6 bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-50"
    >
      <i class="fas fa-robot text-xl" v-if="!isChatOpen"></i>
      <i class="fas fa-times text-xl" v-else></i>
    </button>

    <!-- Чат с нейропомощником -->
    <div
      v-if="isChatOpen"
      class="fixed right-6 bottom-24 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-indigo-100 z-50 transition-all duration-300 max-h-[500px] flex flex-col"
    >
      <!-- Заголовок чата -->
      <div
        class="px-4 py-3 bg-indigo-600 text-white rounded-t-lg flex items-center"
      >
        <div
          class="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3"
        >
          <i class="fas fa-robot text-indigo-600"></i>
        </div>
        <h3 class="font-medium">Нейропомощник</h3>
      </div>

      <!-- Сообщения -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-3"
        style="max-height: 350px"
      >
        <div
          v-if="messages.length === 0"
          class="text-center text-gray-500 my-6"
        >
          <p>Привет! Я твой нейропомощник.</p>
          <p class="mt-2">Чем я могу помочь тебе сегодня?</p>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'p-3 rounded-lg max-w-[85%]',
            message.isUser
              ? 'bg-indigo-100 text-gray-800 ml-auto'
              : 'bg-gray-100 text-gray-800',
          ]"
        >
          {{ message.text }}
        </div>

        <div
          v-if="isLoading"
          class="flex items-center p-3 bg-gray-100 text-gray-800 rounded-lg max-w-[85%]"
        >
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            ></div>
            <div
              class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style="animation-delay: 0.4s"
            ></div>
          </div>
        </div>
      </div>

      <!-- Ввод сообщения -->
      <div class="p-3 border-t border-gray-200">
        <form @submit.prevent="sendMessage" class="flex items-center">
          <input
            v-model="userInput"
            type="text"
            placeholder="Напишите сообщение..."
            class="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg"
            :disabled="isLoading || !userInput.trim()"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import { useTaskStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { aiService, type ChatMessage } from "@/services";
import { v4 as uuidv4 } from "uuid";

const isChatOpen = ref(false);
const userInput = ref("");
const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const taskStore = useTaskStore();
const authStore = useAuthStore();
const sessionId = ref(uuidv4()); // Уникальный идентификатор сессии

// Загрузка истории чата при входе пользователя
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      // Загружаем предыдущие сообщения, если пользователь авторизован
      const chatHistory = await aiService.getChatMessages(
        authStore.user?.id || 0,
        sessionId.value
      );
      messages.value = chatHistory;
    } catch (error) {
      console.error("Ошибка при загрузке истории чата:", error);
    }
  }
});

// Функции для чата
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  // Проверка наличия пользователя
  const userId = authStore.user?.id || 0;

  // Получаем текст вопроса
  const userMessage = userInput.value;

  // Очищаем поле ввода и показываем загрузку
  userInput.value = "";
  isLoading.value = true;

  // Прокрутка к последнему сообщению
  await nextTick();
  scrollToBottom();

  try {
    // Получаем ответ от сервиса AI
    await aiService.getAiResponse(userId, userMessage, sessionId.value);

    // Обновляем сообщения
    const updatedMessages = await aiService.getChatMessages(
      userId,
      sessionId.value
    );
    messages.value = updatedMessages;
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);

    // Если произошла ошибка, добавляем локально сообщения для UI
    messages.value.push({
      id: Date.now(),
      userId,
      text: userMessage,
      isUser: true,
      createdAt: new Date().toISOString(),
      sessionId: sessionId.value,
    });

    messages.value.push({
      id: Date.now() + 1,
      userId,
      text: "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.",
      isUser: false,
      createdAt: new Date().toISOString(),
      sessionId: sessionId.value,
    });
  } finally {
    isLoading.value = false;

    // Прокрутка к новому сообщению
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Отслеживаем изменения в isChatOpen и прокручиваем сообщения вниз при открытии чата
watch(isChatOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});
</script>

<style scoped>
/* Анимации для плавного появления/исчезновения чата */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-300 {
  transition-duration: 300ms;
}
</style>
