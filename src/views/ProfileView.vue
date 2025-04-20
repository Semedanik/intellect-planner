<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Шапка страницы -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Мой профиль</h1>
      </div>
    </header>

    <!-- Основной контент страницы профиля -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
        <!-- Заголовок блока -->
        <h2 class="text-xl font-semibold mb-6">Личная информация</h2>

        <!-- Аватар и кнопка смены фото -->
        <div class="flex items-center space-x-6 mb-8">
          <div
            v-if="authStore.user?.avatar"
            class="w-24 h-24 rounded-full overflow-hidden"
          >
            <img
              :src="authStore.user.avatar"
              alt="Аватар пользователя"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center"
          >
            <span class="text-xl font-semibold text-indigo-600">{{
              authStore.userInitials
            }}</span>
          </div>

          <button
            @click="triggerFileInput"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Изменить фото
          </button>
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept="image/*"
            @change="handleFileChange"
          />
        </div>

        <!-- Форма с данными пользователя -->
        <form @submit.prevent="saveProfileChanges">
          <!-- Имя и фамилия -->
          <div class="mb-4">
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Имя и фамилия
            </label>
            <input
              id="name"
              v-model="profileForm.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Введите ваше имя и фамилию"
            />
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              v-model="profileForm.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Введите ваш email"
            />
          </div>

          <!-- Кнопка сохранения -->
          <div class="flex justify-end mt-6">
            <button
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="loading"
            >
              <span v-if="loading" class="mr-2">
                <i class="fas fa-spinner fa-spin"></i>
              </span>
              Сохранить изменения
            </button>
          </div>
        </form>

        <!-- Сообщение об успешном сохранении -->
        <div
          v-if="savedSuccessfully"
          class="mt-4 p-2 bg-green-100 text-green-700 rounded-md text-sm"
        >
          Ваши данные успешно сохранены
        </div>

        <!-- Сообщение об ошибке -->
        <div
          v-if="error"
          class="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm"
        >
          {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services";

const authStore = useAuthStore();
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref("");
const savedSuccessfully = ref(false);

// Форма профиля
const profileForm = reactive({
  name: "",
  email: "",
});

// Загружаем данные пользователя
onMounted(() => {
  if (authStore.user) {
    profileForm.name = authStore.user.name;
    profileForm.email = authStore.user.email;
  }
});

// Следим за изменениями в пользователе, чтобы обновить форму
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      profileForm.name = newUser.name;
      profileForm.email = newUser.email;
    }
  }
);

// Обработчик нажатия на кнопку "Изменить фото"
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// Обработчик выбора файла
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  if (!file.type.startsWith("image/")) {
    error.value = "Пожалуйста, выберите изображение";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    // Конвертируем изображение в base64 для сохранения
    const base64Image = await convertToBase64(file);

    // Обновляем аватар через authService
    await authStore.updateProfile({
      avatar: base64Image,
    });

    savedSuccessfully.value = true;
    setTimeout(() => {
      savedSuccessfully.value = false;
    }, 3000);
  } catch (err: any) {
    error.value = err.message || "Не удалось обновить фото профиля";
  } finally {
    loading.value = false;
  }
};

// Сохранение изменений профиля
const saveProfileChanges = async () => {
  loading.value = true;
  error.value = "";

  try {
    await authStore.updateProfile({
      name: profileForm.name,
      email: profileForm.email,
    });

    savedSuccessfully.value = true;
    setTimeout(() => {
      savedSuccessfully.value = false;
    }, 3000);
  } catch (err: any) {
    error.value = err.message || "Не удалось сохранить изменения";
  } finally {
    loading.value = false;
  }
};

// Вспомогательная функция для конвертации файла в base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
</script>
