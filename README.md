# 🔗 DevMatch — Backend Server

> A **Tinder-for-Developers** REST API built with Node.js, Express, MongoDB, and Socket.IO. Connect with developers, send connection requests, chat in real-time, and unlock premium memberships via Razorpay.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB (Mongoose v9) |
| Real-time | Socket.IO v4 |
| Auth | JWT + bcrypt |
| Payments | Razorpay |
| Email | AWS SES (`@aws-sdk/client-ses`) |
| Scheduling | node-cron |
| Validation | validator.js |

---

## 📁 Project Structure

```
DevMatchs-server/
├── src/
│   ├── app.js                  # Express app entry point, Socket.IO setup, route mounting
│   │
│   ├── config/
│   │   └── databse.js          # MongoDB connection setup
│   │
│   ├── middlewares/
│   │   └── auth.js             # JWT authentication middleware
│   │
│   ├── models/
│   │   ├── user.js             # User schema (profile, skills, premium status)
│   │   ├── connectionRequest.js# Connection request schema with pre-save hooks
│   │   ├── chat.js             # Chat/message schema
│   │   └── payment.js          # Payment/order schema
│   │
│   ├── routes/
│   │   ├── auth.js             # POST /signup, /login, /logout
│   │   ├── profile.js          # GET/PATCH /profile (view & edit)
│   │   ├── request.js          # POST send/review connection requests + AWS SES email
│   │   ├── user.js             # GET feed, connections, pending requests
│   │   ├── chat.js             # GET chat message history
│   │   └── payment.js          # POST create order, webhook handler (Razorpay)
│   │
│   ├── utils/
│   │   ├── validate.js         # Request body validation helpers
│   │   ├── socket.js           # Socket.IO event handlers (real-time chat)
│   │   ├── sendEmail.js        # AWS SES email sender
│   │   ├── sesClient.js        # AWS SES client configuration
│   │   ├── razorpay.js         # Razorpay client instance
│   │   ├── cronjob.js          # Scheduled jobs (e.g., daily cleanup)
│   │   └── constants.js        # Shared constants
│   │
│   └── repository/             # (Data access layer — reserved for future use)
│
├── .env                        # Environment variables (see below)
├── .gitignore
├── package.json
└── package-lock.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/devmatch

# JWT
JWT_SECRET=your_jwt_secret_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AWS SES
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB instance)
- Razorpay account (for payments)
- AWS account with SES configured (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/sayantangope/DevMatchs-server.git
cd DevMatchs-server

# Install dependencies
npm install

# Add your environment variables
cp .env.example .env
# Edit .env with your credentials

# Run in development mode
npm run dev

# Run in production mode
npm start
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and receive JWT cookie |
| POST | `/auth/logout` | Logout (clears cookie) |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile/view` | Get own profile |
| PATCH | `/profile/edit` | Update profile details |

### Connections / Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/request/send/:status/:userId` | Send interested/ignored request |
| POST | `/request/review/:status/:requestId` | Accept or reject a request |
| GET | `/user/feed` | Browse developer profiles |
| GET | `/user/connections` | List accepted connections |
| GET | `/user/requests/received` | List pending connection requests |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/:targetUserId` | Fetch chat history with a user |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment/create-order` | Create a Razorpay order |
| POST | `/payment/webhook` | Handle Razorpay payment webhook & upgrade user |

---

## 🔌 Real-time (Socket.IO)

The server uses Socket.IO for real-time chat. Events handled in `src/utils/socket.js`:

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinChat` | Client → Server | Join a private chat room |
| `sendMessage` | Client → Server | Send a message in a room |
| `messageReceived` | Server → Client | Deliver message to recipient |

---

## 🗄️ Data Models

### User
- `firstName`, `lastName`, `email`, `password` (hashed)
- `age`, `gender`, `about`, `skills[]`, `photoUrl`
- `isPremium`, `membershipType`

### ConnectionRequest
- `fromUserId`, `toUserId`
- `status`: `ignored` | `interested` | `accepted` | `rejected`

### Chat
- `participants[]` (User refs)
- `messages[]` → `{ senderId, text, createdAt }`

### Payment
- `userId`, `orderId`, `paymentId`, `amount`, `currency`, `status`

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


---

## 👤 Author

**Sayantan Gope**  
GitHub: [@sayantangope](https://github.com/sayantangope)
