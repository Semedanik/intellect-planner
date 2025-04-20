<template>
  <div v-if="isOpen" class="fixed z-20 inset-0 overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ isRegistration ? "Регистрация" : "Авторизация" }}
              </h3>

              <div class="mt-4">
                <form @submit.prevent="handleSubmit">
                  <!-- Email -->
                  <div class="mb-4">
                    <label
                      for="email"
                      class="block text-sm font-medium text-gray-700"
                      >Email</label
                    >
                    <input
                      type="email"
                      id="email"
                      v-model="formData.email"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <!-- Пароль -->
                  <div class="mb-4">
                    <label
                      for="password"
                      class="block text-sm font-medium text-gray-700"
                      >Пароль</label
                    >
                    <input
                      type="password"
                      id="password"
                      v-model="formData.password"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <!-- Имя (только для регистрации) -->
                  <div v-if="isRegistration" class="mb-4">
                    <label
                      for="name"
                      class="block text-sm font-medium text-gray-700"
                      >Имя</label
                    >
                    <input
                      type="text"
                      id="name"
                      v-model="formData.name"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <!-- Сообщение об ошибке -->
                  <div
                    v-if="error"
                    class="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm"
                  >
                    {{ error }}
                  </div>

                  <!-- Ссылка для переключения между авторизацией и регистрацией -->
                  <div class="mb-4 text-sm">
                    <a
                      href="#"
                      class="text-indigo-600 hover:text-indigo-800"
                      @click.prevent="toggleMode"
                    >
                      {{
                        isRegistration
                          ? "Уже есть аккаунт? Войти"
                          : "Нет аккаунта? Зарегистрироваться"
                      }}
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleSubmit"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="loading"
          >
            <span v-if="loading" class="mr-2">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            {{ isRegistration ? "Зарегистрироваться" : "Войти" }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "auth-success"]);

const authStore = useAuthStore();
const isRegistration = ref(false);
const loading = ref(false);
const error = ref("");

const formData = reactive({
  email: "",
  password: "",
  name: "",
});

const toggleMode = () => {
  isRegistration.value = !isRegistration.value;
  error.value = "";
};

const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  formData.email = "";
  formData.password = "";
  formData.name = "";
  error.value = "";
  isRegistration.value = false;
};

const handleSubmit = async () => {
  error.value = "";
  loading.value = true;

  try {
    if (isRegistration.value) {
      // Регистрация
      await authStore.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
    } else {
      // Авторизация
      await authStore.login(formData.email, formData.password);
    }

    // Успешная авторизация
    emit("auth-success");
    closeModal();
  } catch (err: any) {
    error.value =
      err.message ||
      "Произошла ошибка при " +
        (isRegistration.value ? "регистрации" : "авторизации");
  } finally {
    loading.value = false;
  }
};
</script>
