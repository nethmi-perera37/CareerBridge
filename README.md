# CareerBridge – Internship Finding Platform

## 1. Project Overview

CareerBridge is a web-based internship finding platform developed using the MERN stack. It connects students looking for internship opportunities with companies that offer internships.

Students can create accounts, explore available internships, submit applications and track their application statuses. Companies can register, post internship opportunities, manage their postings and review applications received from students.

## 2. Technologies Used

- **Frontend:** React.js and CSS
- **Backend:** Node.js and Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JSON Web Token (JWT)
- **Password Security:** bcryptjs
- **Development Tool:** Visual Studio Code

## 3. Main Features

### Student
- Register and log in as a student.
- Browse available internship opportunities.
- View internship details.
- Submit internship applications with a cover letter.
- View submitted applications.
- Track application statuses.

### Company
- Register and log in as a company.
- Post new internship opportunities.
- View and manage posted internships.
- Edit and delete internship postings.
- Review student applications and cover letters.
- Accept or reject applications.

## 4. Project Structure

```text
CareerBridge/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

## 5. Prerequisites

Before running the application, install:

- Node.js and npm
- Git
- Visual Studio Code or another code editor
- A MongoDB Atlas account and database cluster

## 6. Installation and Setup

### Step 1: Download the Project

Open a terminal and run:

```bash
git clone https://github.com/nethmi-perera37/CareerBridge.git
```

Open the downloaded CareerBridge folder in Visual Studio Code.

### Step 2: Configure MongoDB

Create a MongoDB Atlas cluster and configure a database user.

Add the computer's public IP address under **Network Access** in MongoDB Atlas.

Create a `.env` file inside the backend folder with the following details:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the example values with your own MongoDB connection string and a strong JWT secret.

Do not upload the `.env` file or share its private credentials.

### Step 3: Run the Backend

Open a terminal in Visual Studio Code and execute:

```bash
cd backend
npm install
node server.js
```

The backend connects to MongoDB Atlas and starts on port 5000.

### Step 4: Run the Frontend

Open a second terminal and execute:

```bash
cd frontend
npm install
npm run dev
```

Vite will display a local address for the frontend.

### Step 5: Open the Application

Open the local address displayed in the terminal. Normally, it is:

http://localhost:5173

Keep both the frontend and backend terminals running while using the application.

## 7. Database Collections

CareerBridge uses three main MongoDB collections:

- **Users:** Stores student and company account information.
- **Internships:** Stores internship details posted by companies.
- **Applications:** Stores student applications, cover letters and application statuses.

## 8. Repository

GitHub: https://github.com/nethmi-perera37/CareerBridge
