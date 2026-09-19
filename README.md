# 📅 Weekly Planner & To-Do List Application

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![Azure](https://img.shields.io/badge/Deployment-Azure%20App%20Service-0078D4.svg)](https://portal.azure.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/features/actions)

A full-stack, cloud-hosted **Weekly Planner & Task Management Application** featuring role-based access control (Admin & User), custom daily task scheduling, real-time database persistence, and an integrated Admin Management Panel.

---

## 🌐 Live Production Application

The application is deployed on **Microsoft Azure App Service** and connected to **MongoDB Atlas Cloud**:

| Service | Live URL |
| :--- | :--- |
| **🚀 Main Application (Frontend + Backend)** | **[https://to-do-backend-app-c5a4ecfbcageghfw.eastasia-01.azurewebsites.net](https://to-do-backend-app-c5a4ecfbcageghfw.eastasia-01.azurewebsites.net)** |
| **🩺 Backend API Health & Database Status** | **[https://to-do-backend-app-c5a4ecfbcageghfw.eastasia-01.azurewebsites.net/api/health](https://to-do-backend-app-c5a4ecfbcageghfw.eastasia-01.azurewebsites.net/api/health)** |

---

## ✨ Key Features

### 👤 1. Authentication & Role-Based Access Control (RBAC)
* **User & Admin Roles:** Users can choose their role during registration.
* **Secure Authentication:** Passwords hashed with `bcryptjs` (salt rounds: 10) and sessions secured using signed JSON Web Tokens (`jsonwebtoken`).
* **Admin Privilege:** Admins gain access to a dedicated **Admin Management Panel** to oversee all user activity across the entire system.

### 📅 2. Interactive Weekly Planner
* **7-Day Interactive Board:** Organized Monday through Sunday with dynamic column dates (e.g., `Tuesday 22`) and custom column styling.
* **Automatic Current Day Highlighting:** Detects and highlights today's column (e.g., *Saturday 19 (Today)*).
* **Precise Date Assignment & Weekly Recurrence:**
  * **Specific Date Picker:** Tasks are assigned to an exact calendar date (`YYYY-MM-DD`) via the interactive date picker.
  * **Weekly Repeat Option (`🔁 Repeat every week on this day`):** Tasks can be set as a one-time task for a specific date (default) or set to repeat weekly on that day.
  * **Recurring Badges:** Repeating tasks are clearly badged with `🔁 Weekly`.
  * **Quick-Add Buttons (`+`):** Clicking the `+` button on any day column header instantly selects the exact calendar date for that column in the active week, pre-fills the form, and focuses the task description field.
* **Simulate Next Day:** A simulation feature that allows advancing the active day to test multi-day workflows.

### 📋 3. Task Management
* **Real-time Task Operations:** Add, check off (toggle complete), and delete tasks with instant database persistence.
* **Role & Recurrence Badges:** Tasks display visual badges distinguishing Admin-created tasks (`Admin`), User tasks (`User`), and recurring tasks (`🔁 Weekly`).
* **Shared Visibility:** Admin-created tasks are visible to all users, while personal user tasks remain private to their owner.

### 🗓️ 4. Interactive Calendar & Schedule Timeline Widget
* **Full Month Calendar Navigator:** Browse months forward and backward (`<` / `>`) with dynamic day-grid generation and year indicator (`2026 ▾`).
* **Current & Selected Day Highlighting:** Today's date is accentuated with a sleek slate-teal circular badge (`#46605d`), with custom outlines for selected dates.
* **Accurate Calendar Dot Markers (`•`):** 
  * Only marks the **specific date** assigned to a task (e.g., only Tuesday September 22nd receives a dot).
  * Recurring tasks marked with `🔁 Repeat every week` display dots across all matching days of the week throughout the month.
* **Dynamic Date Synchronization:** Clicking any day in the calendar grid automatically updates the "Assign to Date" picker in the task creation form and filters the schedule timeline to that specific date.
* **Hourly Schedule Timeline & Real-Time Tracking:**
  * Displays structured hourly time slots (`09:00`, `11:00`, `12:00`, `14:00`, `16:00`, `18:00`).
  * **Real-time Live Indicator:** Features an automated live time marker (`HH:MM ●─────────────`) with a glowing indicator tracking the device's real-time system clock.
  * **Dynamic Slot Expansion:** Tasks scheduled at custom times (e.g., `11:38`, `14:30`) automatically generate dedicated time slots in the timeline.
* **Interactive Task Time Management:**
  * **Scheduled Time Picker:** Set an exact scheduled time (`HH:MM`) directly from the sidebar "Add New Task" form.
  * **Clickable Time Slots:** Click any hourly slot ruler in the timeline to instantly populate that time and date into the task creation form and focus the description field.
  * **Instant Time Updating:** Click the time badge (`🕒 HH:MM` or `🕒 Set time`) on any task card—in both the Timeline and 7-day Weekly Board—to update or reschedule the time on the fly.
  * **Interactive Task Cards:** Displays tasks for the active selected date with instant complete/pending checkboxes, weekly recurrence badges, and deletion controls.

### 👨‍💼 5. Admin Management Panel
* **User Statistics Summary Cards:** Live metrics displaying total registered users, total tasks, completed tasks, and pending tasks per user.
* **Global Task Monitoring:** View all tasks across all users with real-time filtering:
  * Filter by User (filter by specific user or view all).
  * Filter by Status (*All*, *Pending*, *Completed*).
* **Admin Deletion Authority:** Administrators can delete inappropriate or completed tasks from any user.

### 🎨 6. Modern UI, Custom Background & Branding
* **Custom Abstract Wave Background:** Elegant dual-tone slate background accented with flowing coral and luminous green wave ribbons (`bg.jpg`).
* **Fluent Glassmorphism UI:** Translucent frosted panels (`rgba(255, 255, 255, 0.85)`), backdrop blur, and modern typography.
* **Multi-Panel Ergonomic Dashboard:** Seamless three-panel layout featuring the Task Sidebar, 7-Day Weekly Board, and Calendar & Timeline widget.
* **Responsive Architecture:** Flex and CSS Grid layouts that adapt smoothly to desktop, tablet, and mobile screens.
* **Custom Branding:** Bottom bar branding: `© 2026 Ravindi Ranthilini. Built with ❤️ and Passion.`

---

## 🏗️ System Architecture

The application is architected as a unified, single-origin full-stack service to eliminate CORS preflight overhead and simplify deployment:

```
                      +-------------------------------------------------------------+
                      |                 Azure App Service (Linux B1)                |
                      |   to-do-backend-app-c5a4ecfbcageghfw.eastasia-01...          |
                      |                                                             |
                      |   +---------------------+        +----------------------+   |
[ Client Browser ] <====> | Express Static Host | <====> |   Express REST API   |   |
                      |   |  (index, css, js)   |        |   (/api/auth, /tasks)|   |
                      |   +---------------------+        +----------+-----------+   |
                      +---------------------------------------------|---------------+
                                                                    |
                                                          Mongoose ODM (TLS)
                                                                    |
                                                                    v
                                                     +------------------------------+
                                                     |    MongoDB Atlas Cluster     |
                                                     |  (AWS / East Asia Replica)   |
                                                     +------------------------------+
```

---

## 💻 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Single-Page Architecture, Flexbox, Grid, Glassmorphism, FontAwesome |
| **Backend** | Node.js, Express.js (v4.18.2) | RESTful API, static asset server, and middleware |
| **Database** | MongoDB Atlas Cloud | Cloud NoSQL database with Mongoose (v7.4.1) ODM |
| **Authentication** | JWT & Bcrypt.js | Token-based stateless authentication & password encryption |
| **Cloud Hosting** | Microsoft Azure App Service | Linux App Service (Plan `ASP-todoappgroup-b301`, East Asia region) |
| **CI / CD** | GitHub Actions | Automated build, test, and artifact deployment on push to `main` |

---

## 📡 REST API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`username`, `email`, `password`, `role`) | Public |
| `POST` | `/api/auth/login` | Log in and receive signed JWT token | Public |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit administrative verification code | Public |

### 📝 Tasks (`/api/tasks`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks for the authenticated user + shared Admin tasks | Authenticated |
| `POST` | `/api/tasks` | Create a new task (`text`, `assignedDayIndex`, `type`, `time`, `date`, `isRecurring`) | Authenticated |
| `PUT` | `/api/tasks/:id` | Update task status (`completed`, `text`, `assignedDayIndex`, `time`, `date`, `isRecurring`) | Owner / Admin |
| `DELETE` | `/api/tasks/:id` | Delete a specific task | Owner / Admin |
| `GET` | `/api/tasks/all` | Get all tasks created by all users across the platform | Admin Only |
| `GET` | `/api/tasks/users` | Get user activity metrics (total, completed, pending tasks) | Admin Only |

### 🩺 System Diagnostics
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Serves the web frontend (`index.html`) | Public |
| `GET` | `/api/health` | Returns real-time database connection and configuration health | Public |

---

## ⚙️ Azure Environment Variables

The following environment variables are configured in the **Azure App Service Portal** under **Settings → Environment variables**:

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/todo_app?appName=Cluster0` |
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens | `secure_jwt_secret_todo_2026` |
| `PORT` | Container listening port (defaults to 8080 on Azure Linux) | `8080` |

---

## 🚀 Local Development Setup

To run the project locally on your machine:

### 1. Clone the repository:
```bash
git clone https://github.com/Ravindi-29/To_Do_App.git
cd To_Do_App
```

### 2. Install backend dependencies:
```bash
cd backend
npm install
```

### 3. Configure environment variables:
Create a `.env` file inside the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

### 4. Start the server:
```bash
npm start
```
The server and web interface will be accessible at `http://localhost:5000`.

---

## 🔄 Automated Deployment (CI/CD)

Every push to the `main` branch automatically triggers GitHub Actions workflow:
* **Workflow File:** `.github/workflows/main_to-do-backend-app.yml`
* **Process:**
  1. Installs Node.js dependencies (`npm install`).
  2. Packages the backend and public frontend bundle.
  3. Authenticates with Microsoft Azure via OpenID Connect (OIDC).
  4. Deploys artifact to `to-do-backend-app` Azure App Service.

---

## 📄 License & Credits

Developed by **Ravindi Ranthilini**.  
© 2026 Ravindi Ranthilini. Built with ❤️ and Passion.
