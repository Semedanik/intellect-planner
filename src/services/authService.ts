import apiClient, {
  checkApiConnection,
  getLocalData,
  saveLocalData,
} from "./api";

export interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const LOCAL_STORAGE_KEY = "intellect_planner_user";

class AuthService {
  private useLocalStorage = false;

  constructor() {
    this.checkConnection();
  }

  private async checkConnection() {
    this.useLocalStorage = !(await checkApiConnection());
    return this.useLocalStorage;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      // В локальном режиме симулируем вход
      // В реальном приложении здесь была бы проверка учетных данных
      const mockUser: User = {
        id: 1,
        name: "Пользователь",
        email: email,
        avatar: undefined,
      };

      const mockResponse: AuthResponse = {
        user: mockUser,
        token: "mock-token-" + Date.now(),
      };

      saveLocalData(LOCAL_STORAGE_KEY, mockResponse);
      return mockResponse;
    }

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      if (error.response && error.response.status === 401) {
        throw new Error("Неверный email или пароль");
      }
      throw new Error("Ошибка при входе в систему");
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      // В локальном режиме симулируем регистрацию
      const mockUser: User = {
        id: 1,
        name: userData.name,
        email: userData.email,
        avatar: undefined,
      };

      const mockResponse: AuthResponse = {
        user: mockUser,
        token: "mock-token-" + Date.now(),
      };

      saveLocalData(LOCAL_STORAGE_KEY, mockResponse);
      return mockResponse;
    }

    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);
      if (error.response && error.response.status === 409) {
        throw new Error("Пользователь с таким email уже существует");
      }
      throw new Error("Ошибка при регистрации");
    }
  }

  async getCurrentUser(): Promise<User> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const authData = getLocalData<AuthResponse | null>(
        LOCAL_STORAGE_KEY,
        null
      );
      if (!authData || !authData.user) {
        throw new Error("Пользователь не авторизован");
      }
      return authData.user;
    }

    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      throw new Error("Не удалось получить данные пользователя");
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const authData = getLocalData<AuthResponse | null>(
        LOCAL_STORAGE_KEY,
        null
      );
      if (!authData || !authData.user) {
        throw new Error("Пользователь не авторизован");
      }

      const updatedUser = { ...authData.user, ...userData };
      saveLocalData(LOCAL_STORAGE_KEY, { ...authData, user: updatedUser });
      return updatedUser;
    }

    try {
      const response = await apiClient.patch("/auth/profile", userData);
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      throw new Error("Не удалось обновить профиль");
    }
  }

  async logout(): Promise<void> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return;
    }

    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  }
}

export default new AuthService();
