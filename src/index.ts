import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'
import passport from 'passport'
import googleStrategy from './utils/googleStrategy'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import cors from 'cors'
import { AllRoutes } from './routes'
import errorHandler from './middlewares/errorHandler'
import checkAuth from './middlewares/checkAuth'
import { addUserSocketId,removeUserSocketId, getUserSocketId } from './services/redisService'
import {addToMatchMakingQueue} from './services/redisQueue'
import {addUserEmbedding} from './services/redisService'
dotenv.config({path: path.resolve(__dirname, '../.env')})
const PORT=process.env.PORT
const app=express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json())
app.use(cookieParser());
const sessionMiddleware=session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());
io.engine.use(passport.initialize());
io.engine.use(passport.session());
googleStrategy();
io.engine.use(checkAuth)
export const SocketIoInstance=io;
app.use(AllRoutes)
app.use(errorHandler)
io.on('connection', async (socket) => {
  try{
  const req = socket.request as express.Request;
  const userId = req.session?.passport?.user as string
  await addUserSocketId(userId,socket.id)
  console.log('User connected', socket.id)

  // Access the session data
  //console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);

  socket.on('start-matchmaking',async()=>{
    const req = socket.request as express.Request;
    const userId = req.session?.passport?.user as string
    await addUserEmbedding(userId)
    await addToMatchMakingQueue(userId)
  })

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    const req = socket.request as express.Request;
    const userId = req.session?.passport?.user as string
    await removeUserSocketId(userId)
  });

  socket.on('signal',async(data)=>{
    io.to(data.targetId).emit('signal',data)
  })

  
}catch(err){
  console.log(err)
}
});


server.listen(Number(PORT),()=>console.log('server running on port: ',PORT))