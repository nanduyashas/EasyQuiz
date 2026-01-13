# 📘 EasyQuiz – Online Quiz & Progress Tracking System

EasyQuiz is a web-based e-learning quiz and progress tracking system developed for school students and administrators. It allows students to attempt subject-based quizzes, view their performance, and download reports, while administrators can manage grades, subjects, quizzes, and view analytics.

The system is built using **React.js**, **Node.js (Express.js)**, and **MongoDB**, following the **Client–Server architecture** and **MVC (Model–View–Controller) pattern**.

---

## 🏗️ Architecture Overview

- **Frontend (View):** React.js – Handles UI rendering and user interactions  
- **Backend (Controller):** Node.js + Express.js – Handles routing and business logic  
- **Database (Model):** MongoDB – Stores application data in collections  
- **Communication:** RESTful APIs over HTTPS  
- **Pattern:** MVC + Layered Architecture  

**Flow:**  
`User (Browser) → React Frontend → Express Backend → MongoDB`

---

## 🚀 Features

### 👨‍🎓 Student Features
- User Registration & Login (JWT Authentication)
- Attempt quizzes by grade and subject
- View progress and performance history
- Download progress reports

### 👩‍💼 Admin Features
- Manage Grades & Subjects
- Create, Update, Delete Quizzes
- View analytics and performance reports
- Export reports as CSV

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- HTML5, CSS3, JavaScript (ES6+)  
- Axios  

### Backend
- Node.js  
- Express.js  
- JWT (Authentication)  
- bcrypt (Password Hashing)  

### Database
- MongoDB  
- Mongoose ODM  

### Tools & Libraries
- json2csv – CSV report generation  
- Winston – Logging  
- Postman – API testing  

---
