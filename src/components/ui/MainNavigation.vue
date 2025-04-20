<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <svg
              class="h-8 w-8 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              ></path>
            </svg>
            <span class="ml-2 text-xl font-semibold text-gray-800"
              >ПланМастер</span
            >
          </div>
          <div class="ml-6 flex space-x-8">
            <router-link
              to="/"
              class="text-gray-500 hover:text-gray-700 inline-flex items-center px-4 pt-1 text-sm font-medium"
              :class="{
                'text-gray-900 border-b-2 border-indigo-500': isActive('/'),
              }"
            >
              Главная
            </router-link>
            <router-link
              to="/tasks"
              class="text-gray-500 hover:text-gray-700 inline-flex items-center px-4 pt-1 text-sm font-medium"
              :class="{
                'text-gray-900 border-b-2 border-indigo-500':
                  isActive('/tasks'),
              }"
            >
              Задачи
            </router-link>
            <router-link
              to="/calendar"
              class="text-gray-500 hover:text-gray-700 inline-flex items-center px-4 pt-1 text-sm font-medium"
              :class="{
                'text-gray-900 border-b-2 border-indigo-500':
                  isActive('/calendar'),
              }"
            >
              Календарь
            </router-link>
          </div>
        </div>
        <div class="flex items-center">
          <button class="p-1 rounded-full text-gray-500 relative">
            <span class="sr-only">Уведомления</span>
            <i class="fas fa-bell"></i>
            <span
              class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            ></span>
          </button>
          <div class="ml-3 relative">
            <button
              class="flex items-center focus:outline-none"
              @click="toggleUserMenu"
            >
              <div
                v-if="!authStore.isAuthenticated"
                class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"
              >
                <i class="fas fa-user"></i>
              </div>
              <div
                v-else
                class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium"
              >
                {{ authStore.userInitials }}
              </div>
            </button>

            <!-- Выпадающее меню пользователя -->
            <div
              v-if="isUserMenuOpen"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div class="py-1" role="menu" aria-orientation="vertical">
                <div v-if="authStore.isAuthenticated">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    <div class="font-medium">{{ authStore.user?.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ authStore.user?.email }}
                    </div>
                  </div>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click.prevent="goToProfile"
                  >
                    Мой профиль
                  </a>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click.prevent="logout"
                  >
                    Выйти
                  </a>
                </div>
                <div v-else>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click.prevent="openAuthModal"
                  >
                    Войти / Зарегистрироваться
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Модальное окно авторизации -->
  <AuthModal
    :is-open="isAuthModalOpen"
    @close="closeAuthModal"
    @auth-success="handleAuthSuccess"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthModal from "@/components/ui/AuthModal.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isUserMenuOpen = ref(false);
const isAuthModalOpen = ref(false);

// При монтировании компонента инициализируем состояние авторизации
onMounted(() => {
  authStore.initialize();

  // Добавляем обработчик клика для закрытия меню при клике вне его
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  // Удаляем обработчик при размонтировании компонента
  document.removeEventListener("click", handleClickOutside);
});

const isActive = (path: string) => {
  return route.path === path;
};

const toggleUserMenu = (event: Event) => {
  event.stopPropagation();
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  // Закрываем меню при клике вне его
  if (isUserMenuOpen.value) {
    isUserMenuOpen.value = false;
  }
};

const openAuthModal = () => {
  isAuthModalOpen.value = true;
  isUserMenuOpen.value = false;
};

const closeAuthModal = () => {
  isAuthModalOpen.value = false;
};

const handleAuthSuccess = () => {
  closeAuthModal();
};

const goToProfile = () => {
  isUserMenuOpen.value = false;
  // Переход на страницу профиля
  router.push("/profile");
};

const logout = () => {
  authStore.logout();
  isUserMenuOpen.value = false;
  // Перенаправляем на главную после выхода
  if (route.path === "/profile") {
    router.push("/");
  }
};
</script>
