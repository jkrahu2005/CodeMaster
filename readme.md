# 🚀 Coding Platform — Full-Stack Online Judge & Learning System

A **production-grade full-stack coding platform** that enables problem creation, editorial writing, secure code execution, and submission tracking — similar to LeetCode / Codeforces — built using **React + Node.js**.

This project demonstrates **end-to-end system design**, **scalable backend architecture**, and **developer-focused UX**, and is designed to be **open-source extensible**.

---

## ✨ Core Features

### 🧠 Problem Management
- Admin-only **Create / Edit / Delete** problems
- Difficulty levels: **Easy / Medium / Hard**
- Topic tags: Arrays, Strings, Graphs, DP, etc.
- Rich problem descriptions with examples & constraints
- Dedicated **Editorial section** per problem

---

### 📝 Editorial System (Key Highlight)
- Rich text editor for explanations
- **Markdown + syntax highlighting**
- **Image uploads (Cloudinary)** for diagrams
- Video embedding support
- Step-by-step solution breakdowns

> Designed to support **educational platforms and open learning communities**

---

### 💻 Code Execution Engine
- Multi-language support:
  - C++
  - Java
  - JavaScript
- Secure real-time execution via **Judge0 API**
- Hidden + visible test cases
- Reference solution verification
- Execution timeout & error handling

---

### 📊 User System
- Authentication (Register / Login)
- JWT-protected routes
- Submission history
- Problem progress tracking
- User profile with statistics

---

## 🏗️ Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS + DaisyUI**
- React Hook Form + Zod (validation)
- Axios (API communication)
- React Quill (editor)
- Cloudinary React SDK

### Backend
- **Node.js + Express**
- **MongoDB (Mongoose)**
- **Redis** (caching & performance)
- JWT authentication
- Judge0 API integration
- Cloudinary for media storage

### Dev & Architecture
- RESTful API design
- Modular backend architecture
- Environment-based configuration
- Open-source friendly setup

---

## 🧩 System Architecture (High Level)

Client (React)
↓
API Gateway (Express)
↓
JWT Auth Middleware
↓
Business Logic & Controllers
↓
MongoDB / Redis
↓
Judge0 API (Code Execution)



---

## 🔐 Authentication Flow

1. User registers or logs in
2. Credentials validated on server
3. JWT token generated
4. Token sent to client
5. Token stored securely on frontend
6. Protected routes verified via middleware

---

📡 API Overview
👤 Authentication & User APIs

Base Path: /user

Method	Endpoint	Description
POST	/user/register	Register new user
POST	/user/login	Login & receive JWT
POST	/user/logout	Logout authenticated user
POST	/user/deleteProfile	Delete user profile
POST	/user/admin/register	Register admin (Admin only)
GET	/user/check	Validate user & fetch profile
🧠 Problem Management APIs

Base Path: /problem

Method	Endpoint	Description
POST	/problem/create	Create problem (Admin only)
PATCH	/problem/update/:id	Update problem (Admin only)
DELETE	/problem/delete/:id	Delete problem (Admin only)
GET	/problem/problemById/:id	Fetch problem by ID
GET	/problem/getAllProblem	Fetch all problems
GET	/problem/problemSolvedByUser	Get solved problems
GET	/problem/submittedProblem/:pid	Check submitted problem
📝 Submissions & Code Execution APIs

Base Path: /submission

Method	Endpoint	Description
POST	/submission/submit/:id	Submit code for problem
POST	/submission/run/:id	Run code without submission
🤖 AI Doubt Solver APIs

Base Path: /ai

Method	Endpoint	Description
POST	/ai/chat	Ask AI doubts related to problems
🎥 Editorial Video APIs

Base Path: /video

Method	Endpoint	Description
GET	/video/create/:problemId	Generate Cloudinary upload signature
POST	/video/save	Save editorial video metadata
DELETE	/video/delete/:problemId	Delete editorial video

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v16+
- MongoDB
- Redis
- RapidAPI key (Judge0)
- Cloudinary account

---

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start

🔑 Environment Variables

Create a .env file in the backend root:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

REDIS_URL=your_redis_url

JUDGE0_API_KEY=your_rapidapi_key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
