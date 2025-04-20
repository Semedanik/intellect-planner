import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Создаем API клиент
const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // Устанавливаем таймаут, чтобы не ждать вечно, если сервер недоступен
  timeout: 5000,
});

// Проверка соединения с API
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    await apiClient.get("/");
    return true;
  } catch (error) {
    console.warn("API сервер недоступен, используем локальное хранилище");
    return false;
  }
};

// Функция для получения данных из локального хранилища
export const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Ошибка при чтении из localStorage: ${key}`, error);
    return defaultValue;
  }
};

// Функция для сохранения данных в локальное хранилище
export const saveLocalData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Ошибка при записи в localStorage: ${key}`, error);
  }
};

// Добавляем перехватчик для добавления токена аутентификации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Если сервер вернул 401, значит токен устарел или недействителен
      localStorage.removeItem("token");
      // При необходимости перенаправляем на страницу логина
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
