# To-Do Application Setup Instructions

## Prerequisites
1. **Node.js**: Ensure you have Node.js installed.
2. **MongoDB**: You need a running MongoDB instance (Local or Atlas).
3. **Gmail App Password**: For Nodemailer to send verification codes.

## Backend Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install` to install dependencies.
3. Open the `.env` file and update the following:
   - `MONGODB_URI`: Set to your MongoDB connection string.
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_PASS`: Your Gmail [App Password](https://myaccount.google.com/apppasswords).
4. Start the server:
   ```bash
   npm start
   ```

## Frontend Setup
1. Since the frontend is static, you can just open `index.html` in your browser.
2. Make sure the backend server is running on `http://localhost:5000`.

## Features
- **Admin & User Roles**: Select your role during sign-up.
- **Email Verification**: Admins receive a 6-digit code via email upon login.
- **Smart Rearrange**: Unfinished tasks from previous days are automatically moved to "Today".
- **Real-time Persistence**: All tasks and users are stored in MongoDB.
