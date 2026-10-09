# Todo App

A lightweight, responsive todo app built with plain HTML, CSS, and JavaScript. Organize tasks by category, set a priority and optional due date, and keep your task list saved in the browser with `localStorage`.

## Features

- **Create tasks** with a name, category, priority, and optional due date.
- **Edit tasks** to change any of their details.
- **Complete and reopen tasks** using the checkbox.
- **Delete individual tasks** or clear all completed tasks.
- **Filter tasks** by status: All, Active, or Completed.
- **Filter by category** using the category selector, which is populated from categories in your task list.
- **Search tasks** by task name, category, or priority. Search can be combined with the status and category filters.
- **Choose a priority:** Low, Medium, or High.
- **Track due dates:** overdue dates are highlighted for tasks that are not complete.
- **Switch between light and dark themes.**
- **Save tasks and theme preferences** in browser storage so they remain available on later visits in that browser.
- **Use on desktop or mobile:** the layout adapts to smaller screens.
- **Keyboard and assistive-technology support:** labeled controls, visible keyboard focus, and an announced status/error message.

## Getting Started

### Requirements

- A modern web browser with JavaScript enabled.
- No package manager, build step, server, or third-party dependency is required.

### Run the app

1. Download or clone this repository.
2. Open `index.html` in your browser.

For a local development server, open the project folder in Visual Studio Code and use a static-server extension such as Live Server, or start any static file server from the project directory. Then open the local URL it provides.

The app consists of:

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, form controls, filters, and task-list container |
| `index.css` | Light and dark themes, task styles, and responsive layout |
| `todo.js` | Task operations, filtering/search, theme toggle, and browser storage |

## Using the App

### Add a task

1. Enter a task name (up to 200 characters).
2. Enter a category (up to 40 characters). The suggested categories are Personal, Work, Shopping, and Health; you can also type a custom category. A blank category is saved as **Personal**.
3. Select Low, Medium, or High priority. New tasks default to **Medium**.
4. Optionally choose a due date.
5. Select **Add task**.

### Manage tasks

- Select a task's checkbox to mark it complete. Select it again to make it active.
- Select **Edit** to update the task name, category, priority, or due date. Select **Save** to keep the changes or **Cancel** to discard them.
- Select **Delete** to remove one task.
- Select **Clear completed** to remove all completed tasks.

### Find tasks

- Use **All**, **Active**, or **Completed** to filter by completion status.
- Use the category selector to show tasks in one category.
- Type in the search box to match task names, categories, or priority labels. Search is case-insensitive.
- These filters work together. For example, select **Active**, choose **Work**, and enter a search term to narrow the list further.

### Change the theme

Use the theme button in the header to toggle between light and dark mode. The app starts in light mode unless a theme preference has already been saved in this browser.

## Local Data and Privacy

The app has no server component. Task data and the theme preference are stored locally in the current browser using `localStorage`:

- `todos` stores the task list.
- `todo-theme` stores the selected theme (`light` or `dark`).

Data is specific to the browser and site origin where the app is opened. It is not synchronized across browsers or devices. Clearing browser site data may delete saved tasks and preferences. If browser storage is unavailable or full, the app reports that it could not save the change.

Each task is stored in this shape:

```json
{
  "id": "unique-task-id",
  "text": "Prepare project notes",
  "completed": false,
  "category": "Work",
  "priority": "medium",
  "dueDate": "2026-10-09"
}
```

The `dueDate` value is an ISO date string (`YYYY-MM-DD`) or an empty string when no date is set. When loading saved tasks, the app supplies defaults for missing category, priority, and completion fields so earlier task records remain usable.

## Project Notes

- This is a client-side app; it does not require an account, database, API, or network connection after the files are available.
- Tasks are rendered as text rather than interpreted as HTML.
- Priority indicates the level selected for a task; tasks are not automatically reordered by priority or due date.
- The task list keeps its creation order.
