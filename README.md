# Task Manager App (Backend)
Server for [Task manager app](https://github.com/deepdhar/task-manager-frontend).

---

## Features
- **User Authentication**:
  - Login and Signup functionality.
  - Forgot Password and Reset Password flow.
- **Task Management**:
  - Add new tasks with a title and description.
  - Edit existing tasks.
  - Delete tasks.
  - View all tasks in a list.

---

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (for database)

---

## Installation

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for the backend)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/deepdhar/task-manager-backend.git
   cd task-manager-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a ```.env``` file in the root directory and add your environment variables**:
   ```env
   PORT=5000
   MONGO_URI=YOUR_MONGO_DB_URI
   JWT_SECRET=YOUR_JWT_TOKEN
   EMAIL_USER=YOUR_EMAIL_ADDRESS
   EMAIL_PASS=YOUR_APP_PASSWORD
   ```

4. **Start the backend server**:
   ```bash
   npm start
   ```

5. **Test the default backend enpoint to ensure the server running**:
   - Open the url on a browser:
     ```bash
     http://localhost:5000/
     ```
