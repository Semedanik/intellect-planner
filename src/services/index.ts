export { default as apiClient } from "./api";
export { default as taskService } from "./taskService";
export { default as eventService } from "./eventService";
export { default as categoryService } from "./categoryService";
export { default as classService } from "./classService";
export { default as statService } from "./statService";
export { default as authService } from "./authService";
export { default as yandexCalendarService } from "./yandexCalendarService";

// Также экспортируем интерфейсы
export type { Task } from "./taskService";
export type { Event } from "./eventService";
export type { Category as Subject } from "./categoryService";
export type { Category } from "./categoryService";
export type { Class } from "./classService";
export type { Stats } from "./statService";
export type { User, AuthResponse } from "./authService";
export type {
  YandexCalendarEvent,
  YandexCalendarConfig,
} from "./yandexCalendarService";
