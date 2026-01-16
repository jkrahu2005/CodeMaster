# 🚀 Coding Platform

A full-stack coding platform with problem creation, editorial sections, submission system, and real-time code execution using Judge0 API.

## ✨ Features

### 🧠 Problem Management
- Create/Edit/Delete problems (Admin only)
- Multiple difficulty levels (Easy, Medium, Hard)
- Problem categorization (Array, String, Graph, DP, etc.)
- Rich text description with examples
- **Editorial section** with detailed explanations and diagrams

### 📝 Editorial System
- **Rich text editor** for editorial content
- **Image uploads** via Cloudinary for diagrams and explanations
- **Markdown support** with syntax highlighting
- **Video explanations** embedding support
- **Step-by-step solution breakdowns**

### 💻 Code Execution
- Multi-language support (C++, Java, JavaScript, Python)
- Real-time code execution via Judge0 API
- Test case validation (Visible & Hidden)
- Reference solution verification

### 📊 User Features
- User authentication (Login/Register)
- Problem solving tracking
- Submission history
- User profile with statistics

## 🏗️ Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** + DaisyUI
- **React Hook Form** + Zod validation
- **Axios** for API calls
- **React Quill** for rich text editor
- **Cloudinary React** for image uploads

### Backend
- **Node.js** + **Express.js**
- **MongoDB** with Mongoose
- **Redis** for caching
- **JWT** authentication
- **Judge0 API** for code execution
- **Cloudinary** for image/video storage

### DevOps
- **Git** for version control
- **GitHub** for repository hosting
- **Environment variables** for configuration

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- Redis
- RapidAPI Key (for Judge0)
- Cloudinary Account (for editorial images)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your environment variables
npm start