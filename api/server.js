const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

// Устанавливаем задержку для имитации реальных сетевых запросов
server.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 300) + 200; // задержка от 200 до 500 мс
  setTimeout(next, delay);
});

// Добавляем middleware
server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Кастомная логика для пользовательских маршрутов
server.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/login") {
    // Имитация аутентификации
    const { email, password } = req.body;
    if (email === "anna@example.com" && password === "password") {
      res.status(200).json({
        user: router.db.get("user").value(),
        token: "fake-jwt-token.for-demo-purposes-only",
      });
    } else {
      res.status(401).json({ message: "Неверный email или пароль" });
    }
    return;
  }

  // Кастомная логика для завершения задач
  if (
    req.method === "PATCH" &&
    req.path.startsWith("/tasks/") &&
    req.body.completed !== undefined
  ) {
    const taskId = parseInt(req.path.split("/").pop());
    const task = router.db.get("tasks").find({ id: taskId }).value();

    if (task) {
      // Если задача помечена как выполненная, обновим статистику
      if (req.body.completed && !task.completed) {
        const stats = router.db.get("stats").value();
        router.db
          .get("stats")
          .assign({
            activeTasks: stats.activeTasks - 1,
            completedToday: stats.completedToday + 1,
            urgentTasks:
              task.priority === "high"
                ? stats.urgentTasks - 1
                : stats.urgentTasks,
          })
          .write();
      }
      // Если задача помечена как невыполненная, обновим статистику
      else if (!req.body.completed && task.completed) {
        const stats = router.db.get("stats").value();
        router.db
          .get("stats")
          .assign({
            activeTasks: stats.activeTasks + 1,
            completedToday: stats.completedToday - 1,
            urgentTasks:
              task.priority === "high"
                ? stats.urgentTasks + 1
                : stats.urgentTasks,
          })
          .write();
      }
    }
  }

  // Продолжаем обработку запроса
  next();
});

// Используем маршруты из базы данных
server.use("/api", router);

// Запускаем сервер
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server запущен на http://localhost:${PORT}`);
  console.log(`API доступно по адресу http://localhost:${PORT}/api`);
});
