const dotenv = require('dotenv') 
dotenv.config() 

const express = require('express') 
const http = require('http') 
const cors = require('cors') 
const helmet = require('helmet') 
const mongoose = require('mongoose') 
const { Server } = require('socket.io') 

const app = express()

app.set('trust proxy', 1)

app.use(helmet()) 
app.use(cors({ 
  origin: [ 
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'https://chamachain-nine.vercel.app', 
    process.env.FRONTEND_URL 
  ].filter(Boolean), 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
})) 
app.use(express.json()) 

const server = http.createServer(app) 

const io = new Server(server, { 
  cors: { 
    origin: [ 
      'http://localhost:5173', 
      'https://chamachain-nine.vercel.app', 
      process.env.FRONTEND_URL 
    ].filter(Boolean), 
    methods: ['GET', 'POST'] 
  } 
}) 

global.io = io 

io.on('connection', (socket) => { 
  socket.on('join', (userId) => { if (userId) socket.join(`user:${userId}`) }) 
  socket.on('join-chama', (chamaId) => { if (chamaId) socket.join(`chama:${chamaId}`) }) 
}) 

// Routes 
const authRoutes = require('./routes/authRoutes') 
const chamaRoutes = require('./routes/chamaRoutes') 
const aiRoutes = require('./routes/aiRoutes') 
const contributionRoutes = require('./routes/contributionRoutes') 
const loanRoutes = require('./routes/loanRoutes') 
const notificationRoutes = require('./routes/notificationRoutes') 
const userRoutes = require('./routes/userRoutes') 
const mpesaRoutes = require('./routes/mpesaRoutes') 
const voteRoutes = require('./routes/voteRoutes') 
const reportRoutes = require('./routes/reportRoutes') 
const superAdminRoutes = require('./routes/superAdminRoutes') 

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/chamas', chamaRoutes)
app.use('/api/v1/ai', aiRoutes)
app.use('/api/v1/contributions', contributionRoutes)
app.use('/api/v1/loans', loanRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/mpesa', mpesaRoutes)
app.use('/api/v1/votes', voteRoutes)
app.use('/api/v1/reports', reportRoutes)
app.use('/api/v1/super-admin', superAdminRoutes) 

app.get('/api/v1/health', (req, res) => { 
  res.json({ success: true, message: 'ChamaChain API running', timestamp: new Date() }) 
}) 

const { errorHandler, notFound } = require('./middleware/errorHandler') 
app.use(notFound) 
app.use(errorHandler) 

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chamachain' 

mongoose.connect(MONGO_URI) 
  .then(() => { 
    console.log('MongoDB connected') 
    const { startCronJobs } = require('./services/cronService') 
    startCronJobs() 
  }) 
  .catch(err => console.error('MongoDB error:', err.message)) 

const PORT = process.env.PORT || 4000 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))