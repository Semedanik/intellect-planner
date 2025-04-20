import { defineStore } from "pinia";
import { eventService, Event } from "../services";
import {
  startOfDay,
  parseISO,
  isAfter,
  isSameDay,
  isWithinInterval,
  addDays,
} from "date-fns";

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export const useEventStore = defineStore("events", {
  state: (): EventState => ({
    events: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchEvents() {
      this.isLoading = true;
      this.error = null;
      try {
        this.events = await eventService.getAll();
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при загрузке событий";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async addEvent(event: Omit<Event, "id">) {
      this.isLoading = true;
      this.error = null;
      try {
        const newEvent = await eventService.create(event);
        this.events.push(newEvent);
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при добавлении события";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async updateEvent(id: number, eventData: Partial<Event>) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedEvent = await eventService.update(id, eventData);
        const index = this.events.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.events[index] = updatedEvent;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при обновлении события";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async deleteEvent(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await eventService.delete(id);
        this.events = this.events.filter((e) => e.id !== id);
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при удалении события";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },

  getters: {
    upcomingEvents: (state) => {
      const today = startOfDay(new Date());

      // Сортировка по дате (от ближайших к дальним)
      return [...state.events]
        .filter((event) => {
          const eventDate = parseISO(event.date);
          return isAfter(eventDate, today) || isSameDay(eventDate, today);
        })
        .sort((a, b) => {
          const dateA = new Date(a.date + "T" + a.time);
          const dateB = new Date(b.date + "T" + b.time);
          return dateA.getTime() - dateB.getTime();
        });
    },

    eventsByDate: (state) => (date: string) => {
      return state.events.filter((event) => event.date === date);
    },

    eventsInRange: (state) => (startDate: Date, endDate: Date) => {
      return state.events
        .filter((event) => {
          const eventDate = parseISO(event.date);
          return isWithinInterval(eventDate, {
            start: startDate,
            end: endDate,
          });
        })
        .sort((a, b) => {
          const dateA = new Date(a.date + "T" + a.time);
          const dateB = new Date(b.date + "T" + b.time);
          return dateA.getTime() - dateB.getTime();
        });
    },

    eventsThisWeek: (state) => {
      const today = startOfDay(new Date());
      const inAWeek = addDays(today, 7);

      return state.events
        .filter((event) => {
          const eventDate = parseISO(event.date);
          return isWithinInterval(eventDate, { start: today, end: inAWeek });
        })
        .sort((a, b) => {
          const dateA = new Date(a.date + "T" + a.time);
          const dateB = new Date(b.date + "T" + b.time);
          return dateA.getTime() - dateB.getTime();
        });
    },
  },
});
