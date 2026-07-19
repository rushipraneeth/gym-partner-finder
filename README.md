# 🏋️ Gym Partner Finder - Backend

A location-based Gym Partner Finder backend built with **Node.js**, **Express.js**, **MongoDB**, and **Socket.IO**.

Users can register, create workout schedules, find compatible gym partners, send partner requests, connect with other users, and chat in real time.

---

# 🚀 Live API

Production URL:

https://gym-partner-finder.onrender.com

Local URL:

http://localhost:5000

---

# 🚀 Features

- User Registration & Login
- JWT Authentication
- User Profile Management
- Gym Selection
- Weekly Workout Schedule
- Match Recommendation System
- Explainable Match Scores
- Partner Requests
- Connections
- Looking for Partner Today
- Privacy Controls
- Blocking Users
- Reporting Users
- Real-Time Chat using Socket.IO
- REST APIs
- MongoDB Atlas Database
- Render Deployment

---

# 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt
- Socket.IO
- Render

---

# 📂 Project Structure

```
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── package.json
└── .env
```

---

# 🔐 Environment Variables

Create a `.env` file.

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET_KEY
```

---

# 🔐 Authentication

Protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# 📌 API Documentation

## Authentication

### Register

```
POST /api/auth/register
```

Request

```json
{
    "username":"john",
    "email":"john@example.com",
    "password":"password123"
}
```

---

### Login

```
POST /api/auth/login
```

---

### Current User

```
GET /api/auth/me
```

---

# 👤 User

### Update Profile

```
PATCH /api/users/profile
```

---

### Update Gym

```
PATCH /api/users/gym
```

---

### Matching Profile

```
GET /api/users/matching-profile
```

---

# 🏋 Workout Schedule

### Create Schedule

```
POST /api/workouts
```

---

### Update Schedule

```
PUT /api/workouts
```

---

### Get Schedule

```
GET /api/workouts
```

---

# 🤝 Match Recommendation

### Eligible Matches

```
GET /api/matches
```

Returns

- Match %
- Time overlap
- Common workout days
- Workout similarity
- Match reasons

---

### Match Details

```
GET /api/matches/:userId
```

---

# 🤝 Partner Requests

### Send Request

```
POST /api/partner-requests
```

---

### Sent Requests

```
GET /api/partner-requests/sent
```

---

### Received Requests

```
GET /api/partner-requests/received
```

---

### Accept Request

```
PATCH /api/partner-requests/:requestId/accept
```

---

### Reject Request

```
PATCH /api/partner-requests/:requestId/reject
```

---

### Connections

```
GET /api/partner-requests/connections
```

---

# 📅 Looking For Partner Today

### Activate

```
POST /api/today/activate
```

---

### Update Workout

```
PUT /api/today/workout
```

---

### Update Workout Time

```
PUT /api/today/time
```

---

### Today's Matches

```
GET /api/today/matches
```

---

# 🔒 Privacy

### Update Privacy Settings

```
PATCH /api/users/privacy
```

---

# 🚫 Blocking

### Block User

```
POST /api/blocks
```

---

# 🚨 Reports

### Report User

```
POST /api/reports
```

---

# 💬 Conversations

### Create Conversation

```
POST /api/conversations
```

---

# 💬 Messages

### Send Message

```
POST /api/messages
```

Request

```json
{
    "conversationId":"conversationId",
    "text":"Hello!"
}
```

---

### Get Conversation Messages

```
GET /api/messages/:conversationId
```

---

# ⚡ Socket.IO Events

## Client → Server

### Join Conversation

```
joinConversation
```

Payload

```javascript
conversationId
```

---

### Send Message

```
sendMessage
```

Payload

```javascript
{
    conversationId,
    senderId,
    receiverId,
    text
}
```

---

## Server → Client

### Receive Message

```
receiveMessage
```

---

### Chat Error

```
chatError
```

---

# 🗄 Database Collections

- Users
- WorkoutSchedules
- PartnerRequests
- Connections
- TodayWorkouts
- Conversations
- Messages
- Blocks
- Reports

---

# 🧪 Testing

The backend has been tested for:

- User Registration
- Login
- JWT Authentication
- Profile Management
- Workout Schedule
- Match Recommendation
- Partner Requests
- Connections
- Looking Today
- Blocking
- Reporting
- Conversations
- Messages
- Socket.IO
- Production Deployment

---

# 🚀 Deployment

Backend deployed on Render.

Database hosted on MongoDB Atlas.

---

# 👨‍💻 Author

Developed by **Rushi Praneeth**

GitHub:
https://github.com/rushipraneeth
