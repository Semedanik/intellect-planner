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
    if (email === "user@example.com" && password === "password") {
      res.status(200).json({
        user: router.db.get("user").value(),
        token: "fake-jwt-token.for-demo-purposes-only",
      });
    } else {
      res.status(401).json({ message: "Неверный email или пароль" });
    }
    return;
  }

  // Обработчик запросов к ИИ помощнику
  if (req.method === "POST" && req.path === "/ai/recommendations") {
    // Генерируем стандартные рекомендации для ИИ помощника
    const recommendations = [
      {
        text: "Выделить время для планирования задач на неделю",
        type: "planning",
        priority: 5,
      },
      {
        text: "Разбивать большие задачи на подзадачи для более эффективной работы",
        type: "productivity",
        priority: 4,
      },
      {
        text: "Планировать перерывы между учебными сессиями для улучшения концентрации",
        type: "rest",
        priority: 3,
      },
    ];

    res.status(200).json(recommendations);
    return;
  }

  // Обработчик для применения рекомендаций
  if (req.method === "POST" && req.path === "/ai/apply-recommendations") {
    res.status(200).json({ success: true });
    return;
  }

  // Кастомная логика для отправки email-уведомлений
  if (req.method === "POST" && req.path === "/notifications/email") {
    const { to, subject, text, html } = req.body;

    // В реальном приложении здесь был бы код для отправки email
    // Но для демонстрации просто логируем и возвращаем успех
    console.log("Отправка email:", { to, subject });
    console.log("Текст:", text);

    // Проверяем, что email совпадает с email пользователя
    const user = router.db.get("user").value();
    if (to !== user.email) {
      res.status(403).json({ message: "Доступ запрещен: не совпадает email" });
      return;
    }

    // Добавляем запись о письме в уведомления для демонстрации
    const newNotification = {
      id: Date.now(),
      userId: 1, // Предполагаем, что это userId пользователя
      title: `Email отправлен: ${subject}`,
      message: `Email отправлен на адрес: ${to}`,
      type: "info",
      createdAt: new Date().toISOString(),
      isRead: false,
      emailSent: true,
    };

    router.db.get("notifications").push(newNotification).write();

    res.status(200).json({ success: true, messageId: `demo-${Date.now()}` });
    return;
  }

  // Кастомная логика для отметки всех уведомлений как прочитанные
  if (
    req.method === "PATCH" &&
    req.path.startsWith("/notifications/mark-all/")
  ) {
    const userId = parseInt(req.path.split("/").pop());

    router.db
      .get("notifications")
      .filter({ userId })
      .forEach((notification) => {
        notification.isRead = true;
      })
      .write();

    res.status(200).json({ success: true });
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
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server запущен на http://localhost:${PORT}`);
  console.log(`API доступно по адресу http://localhost:${PORT}/api`);
});
