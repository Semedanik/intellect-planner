export { default as apiClient } from "./api";
export { default as taskService } from "./taskService";
export { default as eventService } from "./eventService";
export { default as subjectService } from "./subjectService";
export { default as classService } from "./classService";
export { default as statService } from "./statService";
export { default as authService } from "./authService";

// Также экспортируем интерфейсы
export type { Task } from "./taskService";
export type { Event } from "./eventService";
export type { Subject } from "./subjectService";
export type { Class } from "./classService";
export type { Stats } from "./statService";
export type { User, AuthResponse } from "./authService";
