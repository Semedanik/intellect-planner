import apiClient from "./api";

export interface User {
  name: string;
  avatar: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post("/login", { email, password });
    this.setToken(response.data.token);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get("/user");
    return response.data;
  }
}

export default new AuthService();
