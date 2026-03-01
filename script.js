// Constants for Days
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// State Variables
let tasks = [];
let currentRole = "User"; // "Admin" or "User"
let currentDayIndex = 0; // 0 = Monday

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskNameInput = document.getElementById('task-name');
const taskDaySelect = document.getElementById('task-day');
const weekGrid = document.getElementById('week-grid');
const roleSwitch = document.getElementById('role-switch');
const roleIndicator = document.getElementById('role-indicator');
const currentDayDisplay = document.getElementById('current-day-display');
const simulateNextDayBtn = document.getElementById('simulate-next-day');

// Initialization
function init() {
    loadData();
    restoreCorrectCurrentDay();
    setupEventListeners();
    renderApp();
}

function loadData() {
    const savedTasks = localStorage.getItem('windows_todo_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    // Check if we have a simulated day saved
    const savedDayIndex = localStorage.getItem('windows_todo_day_index');
    if (savedDayIndex !== null) {
        currentDayIndex = parseInt(savedDayIndex, 10);
    } else {
        // Automatically detect current day (real time)
        // new Date().getDay() returns 0 for Sunday... 6 for Saturday
        let jsDay = new Date().getDay();
        currentDayIndex = jsDay === 0 ? 6 : jsDay - 1; // Maps Monday to 0, Sunday to 6
    }
}

function saveData() {
    localStorage.setItem('windows_todo_tasks', JSON.stringify(tasks));
    localStorage.setItem('windows_todo_day_index', currentDayIndex.toString());
}

// Ensure the real current day overrides simulated if we want real time behavior,
// BUT since requirements state "Simulate next day", we'll rely on the loaded index.
function restoreCorrectCurrentDay() {
    updateDayDisplay();
}

function setupEventListeners() {
    roleSwitch.addEventListener('change', (e) => {
        currentRole = e.target.checked ? "Admin" : "User";
        roleIndicator.textContent = currentRole;
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });

    simulateNextDayBtn.addEventListener('click', () => {
        currentDayIndex = (currentDayIndex + 1) % 7; // loops back to Monday after Sunday
        updateDayDisplay();
        smartWeeklyRearrangement();
        saveData();
        renderApp();
    });
}

function updateDayDisplay() {
    currentDayDisplay.textContent = DAYS_OF_WEEK[currentDayIndex];
}

function addTask() {
    if (!taskNameInput.value.trim()) return;

    const newTask = {
        id: Date.now().toString(),
        text: taskNameInput.value.trim(),
        assignedDayIndex: DAYS_OF_WEEK.indexOf(taskDaySelect.value),
        completed: false,
        type: currentRole, // "Admin" or "User"
        missed: false // True if week ended and task wasn't done
    };

    tasks.push(newTask);
    saveData();
    renderApp();

    taskNameInput.value = '';
}

function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderApp();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderApp();
}

// 🔁 Smart Weekly Rearrangement Feature
function smartWeeklyRearrangement() {
    // If it's a new week (Monday i.e., index 0 after being 6), mark incomplete as missed
    if (currentDayIndex === 0) {
        tasks.forEach(task => {
            if (!task.completed && !task.missed) {
                // If it was from last week, carry it forward but tag as missed
                task.missed = true;
                task.assignedDayIndex = 0; // Move to Monday of new week
            }
        });
    } else {
        // Move incomplete tasks from earlier days to the current day
        tasks.forEach(task => {
            if (!task.completed && !task.missed && task.assignedDayIndex < currentDayIndex) {
                task.assignedDayIndex = currentDayIndex; // Move forward
            }
        });
    }
}

// UI Rendering
function renderApp() {
    // Before rendering, let's make sure the current real state is reflected
    // For example, if we load the app, check if tasks need moving
    smartWeeklyRearrangement();

    weekGrid.innerHTML = '';

    // Create columns for each day
    DAYS_OF_WEEK.forEach((dayName, index) => {
        const col = document.createElement('div');
        col.className = 'day-column';
        if (index === currentDayIndex) {
            col.classList.add('current-day-col');
        }

        const header = document.createElement('h3');
        header.className = 'day-header';
        header.textContent = dayName + (index === currentDayIndex ? " (Today)" : "");

        const taskListContainer = document.createElement('div');
        taskListContainer.className = 'task-list';

        // Filter tasks for this day
        const dayTasks = tasks.filter(t => t.assignedDayIndex === index);

        dayTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.type.toLowerCase()}-task ${task.completed ? 'completed' : ''}`;

            // Task Header (Type Badge + Delete)
            const taskHeader = document.createElement('div');
            taskHeader.className = 'task-header';

            const badge = document.createElement('span');
            badge.className = `task-type-badge ${task.type.toLowerCase()}-badge`;
            badge.textContent = task.missed ? `Missed / ${task.type}` : task.type;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '<i class="fas fa-trash"></i>';
            delBtn.title = "Delete Task";
            delBtn.onclick = () => deleteTask(task.id);

            taskHeader.appendChild(badge);
            taskHeader.appendChild(delBtn);

            // Task Body (Checkbox + Text)
            const taskBody = document.createElement('div');
            taskBody.className = 'task-body';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox';
            checkbox.checked = task.completed;
            checkbox.onclick = () => toggleTaskComplete(task.id);

            const textNode = document.createElement('span');
            textNode.className = 'task-text';
            textNode.textContent = task.text;

            taskBody.appendChild(checkbox);
            taskBody.appendChild(textNode);

            taskEl.appendChild(taskHeader);
            taskEl.appendChild(taskBody);

            taskListContainer.appendChild(taskEl);
        });

        col.appendChild(header);
        col.appendChild(taskListContainer);
        weekGrid.appendChild(col);
    });
}

// Run App on Load
window.addEventListener('DOMContentLoaded', init);
