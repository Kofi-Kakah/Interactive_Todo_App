const STORAGE_KEY = 'todos';
const THEME_KEY = 'todo-theme';
const priorities = ['low', 'medium', 'high'];

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const categoryInput = document.querySelector('#todo-category');
const priorityInput = document.querySelector('#todo-priority');
const dueDateInput = document.querySelector('#todo-due-date');
const todoList = document.querySelector('#todo-list');
const errorMessage = document.querySelector('#error-message');
const remainingCount = document.querySelector('#remaining-count');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('[data-filter]');
const searchInput = document.querySelector('#search-input');
const categoryFilter = document.querySelector('#category-filter');
const emptyState = document.querySelector('#empty-state');
const themeToggle = document.querySelector('#theme-toggle');

let todos = loadTodos();
let activeFilter = 'all';
let activeCategory = 'all';

function normalizeTodo(todo) {
  if (!todo || typeof todo.text !== 'string') return null;

  return {
    id: typeof todo.id === 'string' ? todo.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: todo.text,
    completed: todo.completed === true,
    category: typeof todo.category === 'string' && todo.category.trim() ? todo.category.trim() : 'Personal',
    priority: priorities.includes(todo.priority) ? todo.priority : 'medium',
    dueDate: typeof todo.dueDate === 'string' ? todo.dueDate : '',
  };
}

function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(savedTodos)) {
      throw new TypeError('Saved todos must be an array.');
    }
    return savedTodos.map(normalizeTodo).filter(Boolean);
  } catch (error) {
    console.error('Could not load saved todos:', error);
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    errorMessage.textContent = '';
    return true;
  } catch (error) {
    console.error('Could not save todos:', error);
    errorMessage.textContent = 'Your changes could not be saved in this browser.';
    return false;
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createEditor(todo) {
  const editForm = makeElement('form', 'edit-form');
  const editName = makeElement('input');
  editName.type = 'text';
  editName.value = todo.text;
  editName.maxLength = 200;
  editName.required = true;
  editName.setAttribute('aria-label', 'Edit task name');

  const editDetails = makeElement('div', 'edit-details');
  const editCategory = makeElement('input');
  editCategory.type = 'text';
  editCategory.value = todo.category;
  editCategory.maxLength = 40;
  editCategory.setAttribute('aria-label', 'Edit category');
  const editPriority = makeElement('select');
  editPriority.setAttribute('aria-label', 'Edit priority');
  priorities.forEach((priority) => {
    const option = makeElement('option', '', `${priority[0].toUpperCase()}${priority.slice(1)} priority`);
    option.value = priority;
    option.selected = todo.priority === priority;
    editPriority.appendChild(option);
  });
  const editDueDate = makeElement('input');
  editDueDate.type = 'date';
  editDueDate.value = todo.dueDate;
  editDueDate.setAttribute('aria-label', 'Edit due date');

  const actions = makeElement('div', 'edit-actions');
  const saveButton = makeElement('button', 'save-btn', 'Save');
  saveButton.type = 'submit';
  const cancelButton = makeElement('button', 'cancel-btn', 'Cancel');
  cancelButton.type = 'button';
  cancelButton.addEventListener('click', renderTodos);

  editDetails.append(editCategory, editPriority, editDueDate);
  actions.append(saveButton, cancelButton);
  editForm.append(editName, editDetails, actions);
  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = editName.value.trim();
    if (!text) {
      editName.focus();
      return;
    }
    todo.text = text;
    todo.category = editCategory.value.trim() || 'Personal';
    todo.priority = editPriority.value;
    todo.dueDate = editDueDate.value;
    saveTodos();
    renderTodos();
  });
  return editForm;
}

function formatDueDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function updateCategoryFilter() {
  const selectedCategory = activeCategory;
  const categories = [...new Set(todos.map((todo) => todo.category))].sort((a, b) => a.localeCompare(b));
  categoryFilter.replaceChildren();
  categoryFilter.appendChild(new Option('All categories', 'all'));
  categories.forEach((category) => categoryFilter.appendChild(new Option(category, category)));
  activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all';
  categoryFilter.value = activeCategory;
}

function renderTodos() {
  updateCategoryFilter();
  todoList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const visibleTodos = todos.filter((todo) => {
    if (activeFilter === 'active' && todo.completed) return false;
    if (activeFilter === 'completed' && !todo.completed) return false;
    if (activeCategory !== 'all' && todo.category !== activeCategory) return false;
    return !searchTerm || `${todo.text} ${todo.category} ${todo.priority}`.toLocaleLowerCase().includes(searchTerm);
  });

  visibleTodos.forEach((todo) => {
    const item = makeElement('li', `todo-item${todo.completed ? ' completed' : ''}`);
    const checkbox = makeElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'active' : 'completed'}`);
    checkbox.addEventListener('change', () => {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const content = makeElement('div', 'todo-content');
    const text = makeElement('span', 'todo-text', todo.text);
    const metadata = makeElement('div', 'todo-metadata');
    metadata.appendChild(makeElement('span', 'category-tag', todo.category));
    metadata.appendChild(makeElement('span', `priority-tag priority-${todo.priority}`, `${todo.priority} priority`));
    if (todo.dueDate) {
      const dueDate = makeElement('span', 'due-date', `Due ${formatDueDate(todo.dueDate)}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = todo.dueDate.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      if (!todo.completed && due < today) dueDate.classList.add('overdue');
      metadata.appendChild(dueDate);
    }
    content.append(text, metadata);

    const actions = makeElement('div', 'todo-actions');
    const editButton = makeElement('button', 'edit-btn', 'Edit');
    editButton.type = 'button';
    editButton.setAttribute('aria-label', `Edit "${todo.text}"`);
    editButton.addEventListener('click', () => {
      item.replaceChildren(createEditor(todo));
      item.querySelector('input[type="text"]').focus();
    });

    const deleteButton = makeElement('button', 'delete-btn', 'Delete');
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Delete "${todo.text}"`);
    deleteButton.addEventListener('click', () => {
      todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    actions.append(editButton, deleteButton);
    item.append(checkbox, content, actions);
    todoList.appendChild(item);
  });

  emptyState.hidden = visibleTodos.length > 0;
  emptyState.textContent = todos.length === 0
    ? 'No tasks yet. Add one above to get started.'
    : 'No tasks match your search or filters.';

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} remaining`;
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const darkMode = theme === 'dark';
  themeToggle.textContent = darkMode ? '☀️ Light' : '🌙 Dark';
  themeToggle.setAttribute('aria-label', `Switch to ${darkMode ? 'light' : 'dark'} mode`);
  themeToggle.setAttribute('aria-pressed', String(darkMode));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    errorMessage.textContent = 'Please enter a task.';
    input.focus();
    return;
  }

  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false,
    category: categoryInput.value.trim() || 'Personal',
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
  });
  input.value = '';
  dueDateInput.value = '';
  errorMessage.textContent = '';
  saveTodos();
  renderTodos();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('selected', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    renderTodos();
  });
});

searchInput.addEventListener('input', renderTodos);
categoryFilter.addEventListener('change', () => {
  activeCategory = categoryFilter.value;
  renderTodos();
});

clearCompletedButton.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Could not save theme preference:', error);
    errorMessage.textContent = 'Your theme preference could not be saved.';
  }
});

let savedTheme = 'light';
try {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') savedTheme = storedTheme;
} catch (error) {
  console.error('Could not load theme preference:', error);
}
setTheme(savedTheme);
renderTodos();
