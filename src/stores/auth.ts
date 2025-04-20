import { defineStore } from "pinia";
import { authService } from "@/services";
import type { User, AuthResponse } from "@/services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem("token"),
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userInitials: (state) => {
      if (!state.user?.name) return "";

      const nameParts = state.user.name.split(" ");
      if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    },
  },

  actions: {
    async initialize() {
      // Проверяем, есть ли токен в localStorage
      const token = localStorage.getItem("token");
      if (token) {
        this.token = token;
        try {
          // Проверяем валидность токена, загружая информацию о пользователе
          this.user = await authService.getCurrentUser();
        } catch (error) {
          // Если токен недействителен, очищаем данные авторизации
          this.logout();
        }
      }
    },

    async login(email: string, password: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await authService.login(email, password);
        this.setAuthData(response);
        return response;
      } catch (error: any) {
        this.error = error.message || "Ошибка при входе в систему";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData: {
      email: string;
      password: string;
      name: string;
    }) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await authService.register(userData);
        this.setAuthData(response);
        return response;
      } catch (error: any) {
        this.error = error.message || "Ошибка при регистрации";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateProfile(userData: Partial<User>) {
      this.isLoading = true;
      this.error = null;

      try {
        const updatedUser = await authService.updateProfile(userData);
        if (this.user) {
          this.user = { ...this.user, ...updatedUser };
        }
        return updatedUser;
      } catch (error: any) {
        this.error = error.message || "Ошибка при обновлении профиля";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setAuthData(data: AuthResponse) {
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem("token", data.token);
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    },
  },
});
