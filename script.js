// Constants
const API_URL = 'http://localhost:5000/api';
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// State
let tasks = [];
let allAdminTasks = [];
let allUsers = [];
let user = null;
let currentDayIndex = 0;
let isLoginMode = true;
let pendingAdminUserId = null;

// Tab switching (Admin only)
function switchTab(tab) {
    const planner = document.getElementById('view-planner');
    const adminPanel = document.getElementById('view-admin');
    const tabPlanner = document.getElementById('tab-planner');
    const tabAdmin = document.getElementById('tab-admin');

    if (tab === 'planner') {
        planner.style.display = 'flex';
        adminPanel.style.display = 'none';
        tabPlanner.classList.add('active');
        tabAdmin.classList.remove('active');
    } else {
        planner.style.display = 'none';
        adminPanel.style.display = 'block';
        tabPlanner.classList.remove('active');
        tabAdmin.classList.add('active');
        loadAdminPanel();
    }
}

// Initialization
function init() {
    setupAuthListeners();
    setupAppListeners();
    checkExistingLogin();
    updateRealTimeDay();
}

function updateRealTimeDay() {
    let jsDay = new Date().getDay();
    currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const display = document.getElementById('current-day-display');
    if (display) display.textContent = DAYS_OF_WEEK[currentDayIndex];
}

// Auth Logic
function setupAuthListeners() {
    const toggleBtn = document.getElementById('toggle-auth-mode');
    const authForm = document.getElementById('auth-form');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (toggleBtn) {
        toggleBtn.onclick = () => {
            isLoginMode = !isLoginMode;
            document.getElementById('auth-title').textContent = isLoginMode ? 'Login' : 'Sign Up';
            document.getElementById('auth-submit-btn').textContent = isLoginMode ? 'Login' : 'Sign Up';
            document.getElementById('username-group').style.display = isLoginMode ? 'none' : 'block';
            document.getElementById('role-selection-group').style.display = isLoginMode ? 'none' : 'block';
            document.getElementById('auth-toggle-text').innerHTML = isLoginMode ?
                "Don't have an account? <span id='toggle-auth-mode'>Sign Up</span>" :
                "Already have an account? <span id='toggle-auth-mode'>Login</span>";
            // Re-bind click after innerHTML change
            setupAuthListeners();
        };
    }

    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;

            if (isLoginMode) {
                await login(email, password);
            } else {
                const username = document.getElementById('reg-username').value;
                const role = document.getElementById('reg-role').value;
                await register(username, email, password, role);
            }
        };
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.onclick = async () => {
            const otp = document.getElementById('otp-input').value;
            await verifyOTP(otp);
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('todo_user');
            user = null;
            location.reload(); // Refresh to clear state
        };
    }
}

async function login(email, password) {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            if (data.status === 'verification_required') {
                pendingAdminUserId = data.userId;
                const modal = document.getElementById('otp-modal');
                if (modal) {
                    modal.style.display = 'flex';
                } else {
                    // Fallback if modal is missing from DOM
                    const otp = prompt("Admin Verification: Please enter the 6-digit code from your email:");
                    if (otp) await verifyOTP(otp);
                }
            } else {
                handleLoginSuccess(data);
            }
        } else {
            alert(data.message || "Login failed");
        }
    } catch (err) {
        alert('Cannot connect to server. Please make sure the backend is running.');
    }
}

async function verifyOTP(otp) {
    try {
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: pendingAdminUserId, otp })
        });
        const data = await res.json();
        if (res.ok) {
            const modal = document.getElementById('otp-modal');
            if (modal) modal.style.display = 'none';
            handleLoginSuccess(data);
        } else {
            alert(data.message || "Invalid Code");
        }
    } catch (err) {
        alert('Verification failed');
    }
}

function handleLoginSuccess(userData) {
    user = userData;
    localStorage.setItem('todo_user', JSON.stringify(user));
    showApp(true);
    loadTasks();
}

function showApp(isLoggedIn) {
    const auth = document.getElementById('auth-container');
    const app = document.getElementById('main-app');
    if (auth) auth.style.display = isLoggedIn ? 'none' : 'flex';
    if (app) app.style.display = isLoggedIn ? 'block' : 'none';

    if (isLoggedIn && user) {
        document.getElementById('user-name-display').textContent = user.username;
        const badge = document.getElementById('role-badge');
        badge.textContent = user.role;
        badge.className = `task-type-badge ${user.role.toLowerCase()}-badge`;

        // Show Admin tabs only for Admin role
        const tabs = document.getElementById('app-tabs');
        if (tabs) tabs.style.display = user.role === 'Admin' ? 'flex' : 'none';
    }
}

function checkExistingLogin() {
    const saved = localStorage.getItem('todo_user');
    if (saved) {
        user = JSON.parse(saved);
        showApp(true);
        loadTasks();
    } else {
        showApp(false);
    }
}

// App Logic
function setupAppListeners() {
    const form = document.getElementById('task-form');
    const simulateBtn = document.getElementById('simulate-next-day');

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await addTask();
        };
    }

    if (simulateBtn) {
        simulateBtn.onclick = () => {
            currentDayIndex = (currentDayIndex + 1) % 7;
            document.getElementById('current-day-display').textContent = DAYS_OF_WEEK[currentDayIndex];
            renderApp();
        };
    }
}

async function loadTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        tasks = await res.json();
        renderApp();
    } catch (err) {
        console.error('Failed to load tasks');
    }
}

async function addTask() {
    const input = document.getElementById('task-name');
    const daySelect = document.getElementById('task-day');
    const text = input.value.trim();
    const assignedDayIndex = DAYS_OF_WEEK.indexOf(daySelect.value);

    if (!text) return;

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ text, assignedDayIndex, type: user.role })
        });
        if (res.ok) {
            input.value = '';
            await loadTasks();
        }
    } catch (err) {
        alert('Failed to add task');
    }
}

async function toggleTaskComplete(id) {
    const task = tasks.find(t => t._id === id);
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ completed: !task.completed })
        });
        if (res.ok) await loadTasks();
    } catch (err) {
        alert('Update failed');
    }
}

async function deleteTask(id) {
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) await loadTasks();
    } catch (err) {
        alert('Delete failed');
    }
}

function renderApp() {
    const grid = document.getElementById('week-grid');
    if (!grid) return;
    grid.innerHTML = '';

    DAYS_OF_WEEK.forEach((dayName, index) => {
        const col = document.createElement('div');
        col.className = 'day-column';
        if (index === currentDayIndex) col.classList.add('current-day-col');

        const header = document.createElement('h3');
        header.className = 'day-header';
        header.textContent = dayName + (index === currentDayIndex ? " (Today)" : "");

        const taskListContainer = document.createElement('div');
        taskListContainer.className = 'task-list';

        const dayTasks = tasks.filter(t => t.assignedDayIndex === index);

        dayTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.type.toLowerCase()}-task ${task.completed ? 'completed' : ''}`;

            const taskHeader = document.createElement('div');
            taskHeader.className = 'task-header';

            const badge = document.createElement('span');
            badge.className = `task-type-badge ${task.type.toLowerCase()}-badge`;
            badge.textContent = task.missed ? `Missed / ${task.type}` : task.type;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '<i class="fas fa-trash"></i>';
            delBtn.onclick = () => deleteTask(task._id);

            taskHeader.appendChild(badge);
            taskHeader.appendChild(delBtn);

            const taskBody = document.createElement('div');
            taskBody.className = 'task-body';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox';
            checkbox.checked = task.completed;
            checkbox.onclick = (e) => {
                e.stopPropagation();
                toggleTaskComplete(task._id);
            };

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
        grid.appendChild(col);
    });
}

// ===== ADMIN PANEL FUNCTIONS =====
async function loadAdminPanel() {
    await Promise.all([loadAllUsers(), loadAllTasks()]);
}

async function loadAllUsers() {
    try {
        const res = await fetch(`${API_URL}/tasks/users`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        allUsers = await res.json();
        renderUsersPanel();
    } catch (err) {
        console.error('Failed to load users');
    }
}

async function loadAllTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks/all`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        allAdminTasks = await res.json();
        renderAllTasksPanel(allAdminTasks);
        populateUserFilter();
    } catch (err) {
        console.error('Failed to load all tasks');
    }
}

function populateUserFilter() {
    const select = document.getElementById('filter-user');
    if (!select) return;
    select.innerHTML = '<option value="all">All Users</option>';
    const seen = new Set();
    allAdminTasks.forEach(t => {
        const u = t.userId;
        if (u && !seen.has(u._id)) {
            seen.add(u._id);
            const opt = document.createElement('option');
            opt.value = u._id;
            opt.textContent = u.username || u.email;
            select.appendChild(opt);
        }
    });
}

function applyAdminFilters() {
    const userFilter = document.getElementById('filter-user').value;
    const statusFilter = document.getElementById('filter-status').value;
    let filtered = [...allAdminTasks];
    if (userFilter !== 'all') filtered = filtered.filter(t => t.userId && t.userId._id === userFilter);
    if (statusFilter === 'pending') filtered = filtered.filter(t => !t.completed);
    if (statusFilter === 'completed') filtered = filtered.filter(t => t.completed);
    renderAllTasksPanel(filtered);
}

function renderUsersPanel() {
    const container = document.getElementById('users-summary');
    if (!container) return;
    container.innerHTML = '';
    if (!allUsers.length) {
        container.innerHTML = '<p style="color:#888;">No registered users found.</p>';
        return;
    }
    allUsers.forEach(u => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <div class="user-name">${u.username} <span style="font-size:0.75rem;color:#888;">(${u.role})</span></div>
            <div class="user-email">${u.email}</div>
            <div class="user-stats">
                <span class="stat-pill total">📋 ${u.totalTasks} Total</span>
                <span class="stat-pill done">✅ ${u.completedTasks} Done</span>
                <span class="stat-pill pend">⏳ ${u.pendingTasks} Pending</span>
            </div>`;
        container.appendChild(card);
    });
}

function renderAllTasksPanel(taskList) {
    const container = document.getElementById('all-tasks-list');
    if (!container) return;
    container.innerHTML = '';

    if (!taskList.length) {
        container.innerHTML = '<p style="color:#888;padding:10px;">No tasks found.</p>';
        return;
    }

    // Header row
    const header = document.createElement('div');
    header.className = 'admin-tasks-header';
    header.innerHTML = `<span>Task</span><span>Owner</span><span>Day</span><span>Status</span><span>Action</span>`;
    container.appendChild(header);

    taskList.forEach(task => {
        const row = document.createElement('div');
        row.className = `admin-task-row ${task.type.toLowerCase()}-type ${task.completed ? 'completed-row' : ''}`;

        const ownerName = task.userId ? (task.userId.username || task.userId.email) : 'Unknown';
        const dayName = DAYS_OF_WEEK[task.assignedDayIndex] || '?';
        const statusHTML = task.completed
            ? `<span style="color:#2e7d32;font-weight:600;">✅ Done</span>`
            : task.missed
                ? `<span style="color:#e65100;font-weight:600;">⚠️ Missed</span>`
                : `<span style="color:#1565c0;font-weight:600;">⏳ Pending</span>`;

        row.innerHTML = `
            <span>${task.text}</span>
            <span class="task-owner">${ownerName}</span>
            <span class="task-day-label">${dayName}</span>
            <span>${statusHTML}</span>
            <span><button class="admin-delete-btn" onclick="adminDeleteTask('${task._id}')">🗑️ Delete</button></span>`;

        container.appendChild(row);
    });
}

async function adminDeleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
            await loadAllTasks(); // Refresh admin view
            await loadTasks();   // Refresh planner view too
        } else {
            alert('Failed to delete');
        }
    } catch (err) {
        alert('Error deleting task');
    }
}

// Ensure script runs regardless of where it's placed
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
