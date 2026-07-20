# Gym Partner Finder 🏋️‍♂️🤝

Gym Partner Finder is a full-stack web application designed to help fitness enthusiasts find their perfect workout partners. By matching users based on their gym location, fitness goals, experience levels, and weekly schedules, this platform makes finding a reliable gym buddy easier than ever.

## ✨ Features

- **Smart Matching Algorithm:** Find partners based on shared gyms, fitness goals (e.g., Muscle Gain, Weight Loss), and experience levels.
- **Weekly Schedule Syncing:** Add your target muscle groups (Chest, Back, Legs, Biceps, etc.) and availability for each day of the week to find users on the exact same split.
- **Real-Time Chat:** Instantly communicate with your matches using integrated real-time WebSockets.
- **Custom Gym Selection:** Use live geolocation via OpenStreetMap to find nearby gyms, or manually enter your own custom gym name.
- **Connection Management:** Keep track of your matches, with built-in tools to report or block inappropriate users to maintain a safe community.
- **Interactive Dashboard:** Dynamic activity charts that automatically scale based on your workout duration, alongside quick-access bento UI cards.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- React Router DOM
- Vanilla CSS (Custom Design System with Glassmorphism & Hover Effects)
- Socket.io-client (Real-time updates)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io (Real-time Chat & WebSockets)
- JWT (JSON Web Tokens) for Authentication

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a MongoDB database (e.g., MongoDB Atlas).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rushipraneeth/gym-partner-finder.git
   cd gym-partner-finder
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   Open a new terminal tab and navigate back to the root, then into the frontend:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   Start the React development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

This project is set up as a monorepo containing both the frontend and backend.

```
gym-partner-finder/
├── backend/                # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers (Auth, Users, Matches, Chat)
│   │   ├── models/         # Mongoose Database Schemas
│   │   ├── routes/         # Express API Routes
│   │   └── sockets/        # Socket.io configuration for real-time chat
│   └── package.json
├── frontend/               # React (Vite) frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Buttons, Modals, Inputs)
│   │   ├── context/        # React Context (Auth, Toast Notifications)
│   │   ├── pages/          # Full page views (Dashboard, Chat, Profile, etc.)
│   │   └── styles/         # Global CSS and Design Tokens
│   └── package.json
└── README.md
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/rushipraneeth/gym-partner-finder/issues).

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
