import apiClient, {
  checkApiConnection,
  getLocalData,
  saveLocalData,
} from "./api";

export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
}

const LOCAL_STORAGE_KEY = "intellect_planner_categories";

// Категории по умолчанию, если данные недоступны
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Учеба",
    description: "Задачи связанные с учебой",
    color: "#4f46e5",
  },
  {
    id: 2,
    name: "Работа",
    description: "Рабочие задачи и проекты",
    color: "#0ea5e9",
  },
  {
    id: 3,
    name: "Личное",
    description: "Личные дела и цели",
    color: "#10b981",
  },
  {
    id: 4,
    name: "Дом",
    description: "Домашние дела",
    color: "#f59e0b",
  },
  {
    id: 5,
    name: "Здоровье",
    description: "Упражнения, медицина и здоровый образ жизни",
    color: "#ef4444",
  },
  {
    id: 6,
    name: "Хобби",
    description: "Увлечения и интересы",
    color: "#8b5cf6",
  },
];

class CategoryService {
  private useLocalStorage = false;
  private nextId = 7; // Следующий ID после категорий по умолчанию

  constructor() {
    this.checkConnection();
    this.initNextId();
  }

  private async checkConnection() {
    this.useLocalStorage = !(await checkApiConnection());
    return this.useLocalStorage;
  }

  private initNextId() {
    const categories = getLocalData<Category[]>(
      LOCAL_STORAGE_KEY,
      DEFAULT_CATEGORIES
    );
    if (categories.length > 0) {
      this.nextId = Math.max(...categories.map((category) => category.id)) + 1;
    }
  }

  async getAll(): Promise<Category[]> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      return getLocalData<Category[]>(LOCAL_STORAGE_KEY, DEFAULT_CATEGORIES);
    }

    try {
      // Пытаемся сначала получить категории
      const response = await apiClient.get("/categories");
      return response.data;
    } catch (error) {
      try {
        // Если категорий нет, пробуем получить предметы и преобразовать их в категории
        const subjectsResponse = await apiClient.get("/subjects");
        const subjects = subjectsResponse.data;

        // Преобразуем предметы в категории
        const categories = subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
          description: `Категория преобразована из предмета '${subject.name}'`,
          color: subject.color,
        }));

        return categories;
      } catch (error) {
        console.error("Ошибка при получении категорий из API:", error);
        return getLocalData<Category[]>(LOCAL_STORAGE_KEY, DEFAULT_CATEGORIES);
      }
    }
  }

  async getById(id: number): Promise<Category> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const categories = getLocalData<Category[]>(
        LOCAL_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      const category = categories.find((s) => s.id === id);
      if (!category) throw new Error(`Категория с ID ${id} не найдена`);
      return category;
    }

    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      try {
        // Пробуем получить предмет и преобразовать его в категорию
        const subjectResponse = await apiClient.get(`/subjects/${id}`);
        const subject = subjectResponse.data;
        return {
          id: subject.id,
          name: subject.name,
          description: `Категория преобразована из предмета '${subject.name}'`,
          color: subject.color,
        };
      } catch (subjectError) {
        console.error(`Ошибка при получении категории с ID ${id}:`, error);
        const categories = getLocalData<Category[]>(
          LOCAL_STORAGE_KEY,
          DEFAULT_CATEGORIES
        );
        const category = categories.find((s) => s.id === id);
        if (!category) throw new Error(`Категория с ID ${id} не найдена`);
        return category;
      }
    }
  }

  async create(category: Omit<Category, "id">): Promise<Category> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const categories = getLocalData<Category[]>(
        LOCAL_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      const newCategory = { ...category, id: this.nextId++ };
      categories.push(newCategory);
      saveLocalData(LOCAL_STORAGE_KEY, categories);
      return newCategory;
    }

    try {
      const response = await apiClient.post("/categories", category);
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
      const categories = getLocalData<Category[]>(
        LOCAL_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      const newCategory = { ...category, id: this.nextId++ };
      categories.push(newCategory);
      saveLocalData(LOCAL_STORAGE_KEY, categories);
      return newCategory;
    }
  }

  async update(id: number, category: Partial<Category>): Promise<Category> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      const categories = getLocalData<Category[]>(
        LOCAL_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      const index = categories.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Категория с ID ${id} не найдена`);

      const updatedCategory = { ...categories[index], ...category };
      categories[index] = updatedCategory;
      saveLocalData(LOCAL_STORAGE_KEY, categories);
      return updatedCategory;
    }

    try {
      const response = await apiClient.patch(`/categories/${id}`, category);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении категории с ID ${id}:`, error);
      const categories = getLocalData<Category[]>(
        LOCAL_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      const index = categories.findIndex((s) => s.id === id);
      if (index === -1) throw new Error(`Категория с ID ${id} не найдена`);

      const updatedCategory = { ...categories[index], ...category };
      categories[index] = updatedCategory;
      saveLocalData(LOCAL_STORAGE_KEY, categories);
      return updatedCategory;
    }
  }

  async delete(id: number): Promise<void> {
    await this.checkConnection();

    if (this.useLocalStorage) {
      let categories = getLocalData<Category[]>(
        LOCAL_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      categories = categories.filter((s) => s.id !== id);
      saveLocalData(LOCAL_STORAGE_KEY, categories);
      return;
    }

    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (error) {
      console.error(`Ошибка при удалении категории с ID ${id}:`, error);
      let categories = getLocalData<Category[]>(
        LOCAL_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      categories = categories.filter((s) => s.id !== id);
      saveLocalData(LOCAL_STORAGE_KEY, categories);
    }
  }
}

export default new CategoryService();
