
const chkFilter = $('.todo-filter-block input');
const todoListEl = $('.todo-list');
//const addTodoForm = $('.add-todo-form');
//const btnDelAll = $('.btn-del-all');
// Загрузка даних з сервера під час ініціалізації
$(document).ready(function () {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/list',
    success: function (data) {
      //todos = Array.isArray(data) ? data : [];
      todos = data;
      console.log(todos);
      renderTodoList(todos, todoListEl);
    },
    error: function (error) {
      console.error('Error loading from server:', error);
    }
  });
});
let isFiltered = chkFilter.prop('checked');
//let todos = [];
let lastId = getIdFromLocalStorage() !== null ? getIdFromLocalStorage() : 0;

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
      $(this).addClass('del').remove();
    }, 500);
  });

  todos = [];
  saveToServer();
  console.log('Data cleared:', todos);
});

chkFilter.on('change', function () {
  isFiltered = $(this).prop('checked');
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
    // id: id,
    text: valueText,
    completed: false,
  };

  //todos.push(arrTodoAdd);
  todos = arrTodoAdd;
  renderTodoList(todos, todoListEl);
  saveToServer();
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
      //console.log(item.id == $(this).closest('.todo-item').data('id'));
      return item.id == id;
    });
    console.log(todo);

    if (!todo) {
      return;
    }
    const todoToUpdate = data.find(obj => obj.id === todo.id);
    // Оновлюємо властивості знайденого об'єкта
    todoToUpdate.completed = !todo.completed;
    // Оновлюємо масив todos
    data.forEach((obj, index) => {
      if (obj.id === todo.id) {
        data[index] = todoToUpdate;
      }
    });
    //todos = data;
    console.log(data);

    //todo.completed = !todo.completed;
    renderTodoList(data, todoListEl);
    saveToServerCheck(data);
  });
  
  const delBtns = $('.todo-item__delBtn');
  delBtns.on('click', function () {
    const id = $(this).closest('.todo-item').data('id');
    const todoItemToRemove = $(this).closest('.todo-item');
    const indexToRemove = todos.findIndex(function (item) {
      return item.id == id;
    });

    if (indexToRemove !== -1) {
      todos.splice(indexToRemove, 1);

      todoItemToRemove.addClass('del');

      setTimeout(() => {
        todoItemToRemove.remove();
        saveToServer();
      }, 500);
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

function saveToServer() {
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/list',
    contentType: 'application/json',
    //data: JSON.stringify({ list: todos }),
    data: JSON.stringify(todos),
    //data: todos,
    success: function (data) {
      console.log('Data saved to server:', data);
    },
    error: function (error) {
      console.error('Error saving to server:', error);
    }
  });
}

function saveToServerCheck(item) {
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/list',
    contentType: 'application/json',
    //data: JSON.stringify({ list: todos }),
    data: JSON.stringify(item),
    //data: todos,
    success: function (data) {
      console.log('Data saved to server:', data);
    },
    error: function (error) {
      console.error('Error saving to server:', error);
    }
  });
}

function saveLocalStorage() {
  const jsonData = JSON.stringify(todos);
  localStorage.setItem('todos', jsonData);
  localStorage.setItem('id', lastId);

  console.log('Data saved:', todos);
  return todos;
}

function getLocalStorage() {
  const getData = localStorage.getItem('todos');
  const todosData = JSON.parse(getData);

  console.log('Data loaded:', todosData);
  return todosData;
}

function getIdFromLocalStorage() {
  const storedId = localStorage.getItem('id');
  return storedId ? parseInt(storedId) : null;
}
