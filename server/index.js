const express = require('express');
const fs = require("fs");
const app = express();
//Читаємо статичні файли
app.use(express.static('public'));
//app.use(express.json({extended: true, limit: '1mb'}));
app.use(express.json());

app.get("/api/todos", (req, res) => {
  // Читання даних з db.json
  fs.readFile("./server/db.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Помилка при читанні db.json:", err);
      res.status(500).send("Помилка сервера");
      return;
    }

    const todos = JSON.parse(data);

    res.status(200).send(todos);
  });
});

app.post("/api/todosadd", (req, res) => {
  const newTodo = req.body;
  console.log("newTodo: ", newTodo);

  // Читання даних з db.json
  fs.readFile("./server/db.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Помилка при читанні db.json:", err);
      res.status(500).send("Помилка сервера");
      return;
    }

    const todos = JSON.parse(data);

    // Додавання нового елемента до списку
    todos.list.push(newTodo);

    // Запис даних до db.json
    fs.writeFile("./server/db.json", JSON.stringify(todos), err => {
      if (err) {
        console.error("Помилка при записі db.json:", err);
        res.status(500).send("Помилка сервера");
        return;
      }

      res.status(201).send("Дані успішно збережено!");
    });
  });
});

app.put("/api/todosup/:id", (req, res) => {
  const id = req.params.id;
  const newCompleted = req.body.completed;
  console.log("newCompleted: ", newCompleted);

  // Читання даних з db.json
  fs.readFile("./server/db.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Помилка при читанні db.json:", err);
      res.status(500).send("Помилка сервера");
      return;
    }

    const todos = JSON.parse(data);

    // Пошук завдання за ID
    const todo = todos.list.find(t => t.id === id);

    if (!todo) {
      res.status(404).send("Завдання не знайдено");
      return;
    }

    // Оновлення тексту завдання
    todo.completed = newCompleted;
	console.log("todo: ", todo);

    // Запис даних до db.json
    fs.writeFile("./server/db.json", JSON.stringify(todos), err => {
      if (err) {
        console.error("Помилка при записі db.json:", err);
        res.status(500).send("Помилка сервера");
        return;
      }

      res.status(200).send("Дані успішно оновлено!");
    });
  });
});

app.delete("/api/todosdell/:id", (req, res) => {
  const id = req.params.id;

  // Читання даних з db.json
  fs.readFile("./server/db.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Помилка при читанні db.json:", err);
      res.status(500).send("Помилка сервера");
      return;
    }

    const todos = JSON.parse(data);

    // Пошук завдання за ID
    const todoIndex = todos.list.findIndex(t => t.id === id);

    if (todoIndex === -1) {
      res.status(404).send("Завдання не знайдено");
      return;
    }

    // Видалення завдання з списку
    todos.list.splice(todoIndex, 1);

    // Запис даних до db.json
    fs.writeFile("./server/db.json", JSON.stringify(todos), err => {
		if (err) {
			console.error("Помилка при записі db.json:", err);
			res.status(500).send("Помилка сервера");
			return;
		}

		res.status(200).send("Дані успішно видалено!");
    });
  });
});

app.delete("/api/todos/all", (req, res) => {
  fs.readFile("./server/db.json", "utf-8", (err, data) => {
		if (err) {
		  console.error("Помилка при читанні db.json:", err);
		  res.status(500).send("Помилка сервера");
		  return;
		}

		const todos = JSON.parse(data);
		// Очищення списку завдань
		todos.list = [];

	  // Запис даних до db.json
	  fs.writeFile("./server/db.json", JSON.stringify(todos), err => {
		if (err) {
		  console.error("Помилка при записі db.json:", err);
		  res.status(500).send("Помилка сервера");
		  return;
		}

		res.status(200).send("Всі завдання успішно видалено!");
	  });
  });
});

app.listen(3000, () => {
  console.log("Сервер запущено на порту 3000");
});