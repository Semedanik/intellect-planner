import { defineStore } from "pinia";
import { classService, categoryService, Class, Subject } from "../services";

interface ScheduleState {
  classes: Class[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
}

export const useScheduleStore = defineStore("schedule", {
  state: (): ScheduleState => ({
    classes: [],
    subjects: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchClasses() {
      this.isLoading = true;
      this.error = null;
      try {
        this.classes = await classService.getAll();
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при загрузке расписания";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSubjects() {
      this.isLoading = true;
      this.error = null;
      try {
        this.subjects = await categoryService.getAll();
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при загрузке предметов";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async addClass(classItem: Omit<Class, "id">) {
      this.isLoading = true;
      this.error = null;
      try {
        const newClass = await classService.create(classItem);
        this.classes.push(newClass);
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при добавлении занятия";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async updateClass(id: number, classData: Partial<Class>) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedClass = await classService.update(id, classData);
        const index = this.classes.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.classes[index] = updatedClass;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при обновлении занятия";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async deleteClass(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await classService.delete(id);
        this.classes = this.classes.filter((c) => c.id !== id);
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при удалении занятия";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async addSubject(subject: Omit<Subject, "id">) {
      this.isLoading = true;
      this.error = null;
      try {
        const newSubject = await categoryService.create(subject);
        this.subjects.push(newSubject);
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при добавлении предмета";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async updateSubject(id: number, subjectData: Partial<Subject>) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedSubject = await categoryService.update(id, subjectData);
        const index = this.subjects.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.subjects[index] = updatedSubject;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при обновлении предмета";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async deleteSubject(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await categoryService.delete(id);
        this.subjects = this.subjects.filter((s) => s.id !== id);
      } catch (error) {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = "Произошла ошибка при удалении предмета";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },

  getters: {
    classesByDay: (state) => (day: string) => {
      return state.classes
        .filter((c) => c.day === day)
        .sort((a, b) => {
          const timeA = a.time.split(" - ")[0];
          const timeB = b.time.split(" - ")[0];
          return timeA.localeCompare(timeB);
        });
    },

    getSubjectById: (state) => (id: number) => {
      return state.subjects.find((s) => s.id === id);
    },

    getSubjectColor: (state) => (id: number) => {
      const subject = state.subjects.find((s) => s.id === id);
      return subject ? subject.color : "#cccccc";
    },
  },
});
