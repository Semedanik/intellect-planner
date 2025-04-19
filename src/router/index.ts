import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomeView.vue"; // исправлен путь к HomeView.vue
import TasksView from "../views/TasksView.vue";
import CalendarView from "../views/CalendarView.vue";
import ScheduleView from "../views/ScheduleView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/tasks",
    name: "Tasks",
    component: TasksView,
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: CalendarView,
  },
  {
    path: "/schedule",
    name: "Schedule",
    component: ScheduleView,
  },
];

const router = createRouter({
  history: createWebHistory(""),
  routes,
});

export default router;
