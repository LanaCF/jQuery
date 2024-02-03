
const chkFilter = $('.todo-filter-block input');
const todoListEl = $('.todo-list');
let todos = [];
//const addTodoForm = $('.add-todo-form');
//const btnDelAll = $('.btn-del-all');
// Загрузка даних з сервера під час ініціалізації
let todosLength = 0;
$(document).ready(function () {
  $.ajax({
    method: 'GET',
    url: '/api/todos',
    success: function (data) {
      //todos = Array.isArray(data) ? data : [];
      todos = data.list;
	  todosLength = todos.length;
	  console.log("todosLength: ", todosLength);
      console.log("data: ", data);
      console.log("todos: ", todos);
      renderTodoList(todos, todoListEl);
    },
    error: function (error) {
      console.error('Error loading from server:', error);
    }
  });
});
let isFiltered = chkFilter.prop('checked');
console.log("isFiltered: ",isFiltered);
//let todos = [];

const addText = $('<input>').addClass('add-text').attr({
  'placeholder': 'Add your new task',
});

const btnAdd = $('<button>').addClass('btn-add').prop({
  'disabled': true,
}).text('Add');

$('.add-todo-form').append(addText);
$('.add-todo-form').append(btnAdd);

//renderTodoList(todos, todoListEl);

$('.btn-del-all').on('click', function (event) {
	event.preventDefault();
	$('.todo-item').each(function () {
		//const todoItem = $(this).addClass('del');

		setTimeout(() => {
		  $(this).remove();
		}, 500);
	});
	todos = [];
	todosLength = 0;
	saveToServerDellAll();
	console.log('Data cleared:', todos);
});

chkFilter.on('change', function () {
  isFiltered = $(this).prop('checked');
  console.log("isFiltered: ",isFiltered);
  renderTodoList(todos, todoListEl);
});

addText.on('input', function () {
  const valueText = $(this).val();

  if (valueText.length >= 1) {
    btnAdd.prop('disabled', false);
  } else {
    btnAdd.prop('disabled', true);
  }
});

btnAdd.on('click', function (event) {
  event.preventDefault();
  btnAdd.prop('disabled', true);

  const valueText = addText.val();
  // const id = lastId++;
  const arrTodoAdd = {
    id: Math.random().toString(36).substring(7),
    text: valueText,
    completed: false,
  };

  //todos.push(arrTodoAdd);
  todos = arrTodoAdd;
  console.log("Додали завдання", todos);
  //renderTodoList(todos, todoListEl);
  saveToServer(arrTodoAdd);
  addText.val('');
});

function getFilteredTodos(data) {
  let filteredTodos = [];
  if (isFiltered) {
    filteredTodos = data.filter(function (todo) {
      return !todo.completed;
    });
  } else {
    filteredTodos = data.filter(function (todo) {
      return todo;
    });
  }

  return filteredTodos;
}

function renderTodoList(rawData, parentEl) {
  if (!checkValidArgs(rawData, parentEl)) {
    return;
  }
  console.log(rawData);

  const data = getFilteredTodos(rawData);

  let todoChksEls;

  let todoItems = data.map(function (item, index) {
    const todoItem = $('<li>').addClass('todo-item show').attr('data-id', item.id);

    const todoNumber = $('<span>').addClass('todo-item__number mr-1').text(index + 1);
    const todoCompleted = $('<input>').addClass('todo-item__completed mr-1').attr({
      'type': 'checkbox',
      'checked': item.completed,
    });
    const todoText = $('<p>').text(item.text);
    const todoDelBtn = $('<button>').addClass('todo-item__delBtn').text('del');
    if (item.completed) {
      todoText.addClass('todo-item__text_completed');
    } else {
      todoText.addClass('todo-item__text mr-1');
    }

    todoItem.append(todoNumber, todoCompleted, todoText, todoDelBtn);
    //$('todo-item p').addClass(`${item.completed} ? 'todo-item__text_completed' : 'todo-item__text mr-1'`)

    return todoItem;
  });

  parentEl.html(todoItems);

  todoChksEls = $('.todo-item__completed');
  if (!todoChksEls.length) {
    console.warn('Todo checks not found !!!');
    return;
  }

  todoChksEls.on('change', function () {
    const id = $(this).closest('.todo-item').data('id');
    const todo = data.find(function (item) {
      return item.id == id;
    });
    console.log(todo);

    if (!todo) {
      return;
    }
    const todoToUpdate = data.find(obj => obj.id === todo.id);
    // Оновлюємо властивості знайденого об'єкта
    todoToUpdate.completed = !todo.completed;
	
	$(this).siblings("p").toggleClass("todo-item__text_completed");
    // Оновлюємо масив todos
    data.forEach((obj, index) => {
      if (obj.id === todo.id) {
        data[index] = todoToUpdate;
      }
    });
	
    console.log(data);
    saveToServerCheck(todoToUpdate);
  });
  
  const delBtns = $('.todo-item__delBtn');
  //$(document).on('click', '.todo-item__delBtn', function() {
	$('.todo-list').delegate('.todo-item__delBtn', 'click', function() {
  //delBtns.on('click', function () {
    const id = $(this).closest('.todo-item').data('id');
    const todoItemToRemove = $(this).closest('.todo-item');
    const indexToRemove = data.findIndex(function (item) {
      return item.id == id;
    });
	console.log("indexToRemove: ", todoItemToRemove);

    if (indexToRemove !== -1) {
      data.splice(indexToRemove, 1);

      setTimeout(() => {
        todoItemToRemove.remove();
		--todosLength;
      }, 500);
	  saveToServerDell(id);
    }
  });
}

function checkValidArgs(data, parentEl) {
  if (!parentEl) {
    console.warn('Parent Element not found');
    return false;
  }
  if (!Array.isArray(data)) {
    console.warn('Argument data must be an Array');
    return false;
  }

  return true;
}

function saveToServer(item) {
	$.ajax({
      url: "/api/todosadd",
      method: "POST",
      //data: JSON.stringify({ list: item}),
	  data: JSON.stringify(item),
      contentType: "application/json",
      success: function(response) {
        console.log("Дані успішно збережено!", JSON.stringify(item));

        // Оновлення інтерфейсу
        //renderTodoList(item, $('.todo-list'));
		$('.todo-list').append(
			$('<li>').addClass('todo-item show').attr('data-id', item.id).append(
				$('<span>').addClass('todo-item__number mr-1').text(++todosLength),
				$('<input>').addClass('todo-item__completed mr-1').attr({
				  'type': 'checkbox',
				  'checked': item.completed,
				}),
				$('<p>').text(item.text),
				$('<button>').addClass('todo-item__delBtn').text('del')
			)
		);
	
      },
      error: function(error) {
        console.error("Помилка при збереженні даних:", error);
      },
	});
}

function saveToServerCheck(item) {
    const completed = item.completed;
	$.ajax({
		url: "/api/todosup/" + item.id,
		method: "PUT",
		data: JSON.stringify({ completed }),
		contentType: "application/json",
		success: function(response) {
		  console.log("Дані успішно оновлено!");
		  ('todo-item__text_completed');
		},
		error: function(error) {
		  console.error("Помилка при оновленні даних:", error);
		},
	});
}

function saveToServerDell(item) {
	$.ajax({
		url: "/api/todosdell/" + item,
		method: "DELETE",
		success: function(response) {
		  console.log("Дані успішно видалено!");

		  // Оновлення інтерфейсу
		  // ...
		},
		error: function(error) {
		  console.error("Помилка при видаленні даних:", error);
		},
	});
}

function saveToServerDellAll() {
	$.ajax({
		url: "/api/todos/all",
		method: "DELETE",
		success: function(response) {
		  console.log("Дані успішно видалено!");
		},
		error: function(error) {
		  console.error("Помилка при видаленні даних:", error);
		},
	});
}