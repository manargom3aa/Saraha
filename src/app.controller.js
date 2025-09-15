import path  from 'node:path';
import dotenv from 'dotenv';
// dotenv.config({ path: './src/config/.env.dev' });
dotenv.config({})



import userController from './modules/user/user.controller.js'
import authController from './modules/auth/auth.controller.js'
import messageController from './modules/message/message.controller.js'

import express from 'express'
import connectDB from './DB/connection.db.js';
import { globalErrorHandling } from './utils/response.js';
import cors from 'cors'
import morgan from 'morgan';
import { sendEmail } from './utils/email/send.email.js';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const bootstrap = async() => {
const app = express();
const PORT = 3000;


//cors
app.use(cors())
app. use(morgan('dev'))
app.use(helmet())

const limiter = rateLimit ({
    windowMs: 60* 1000,
    limit: 5,
    message: { error: "BAS BA to many request"}
})
app.use('/auth',limiter)
//DB 
await connectDB()

app.use("/uploads",express.static(path.resolve('./src/uploads')))

//convert json buffer data

app.use(express.json())
//app.router
app.get('/', (req, res) =>res.json({ message:'Hello world!'}));
app.use("/auth", authController)
app.use("/user" , userController)
app.use("/message" , messageController)

app.all('{/*dummy}', (req,res) => res.status(404).json({message:"In-valid routing ❌"}))

app.use(globalErrorHandling)

await sendEmail({ to: "manargom3aa@gmail.com", text : "hello"})

 return app.listen(PORT, () =>console.log(`Server running on port ${PORT} 🚀`));
}
export default bootstrap