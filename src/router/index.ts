import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomeView.vue"; // исправлен путь к HomeView.vue
import TasksView from "../views/TasksView.vue";
import CalendarView from "../views/CalendarView.vue";
import ProfileView from "../views/ProfileView.vue";

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
    path: "/profile",
    name: "Profile",
    component: ProfileView,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(""),
  routes,
});

// Проверка авторизации перед переходом на страницы, требующие авторизации
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const token = localStorage.getItem("token");

  if (requiresAuth && !token) {
    next("/");
  } else {
    next();
  }
});

export default router;
