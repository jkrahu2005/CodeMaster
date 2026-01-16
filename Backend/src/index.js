const express=require('express');
const app=express();
app.use(express.json())
const cookieparser=require('cookie-parser')
app.use(cookieparser());
require('dotenv').config();
const main=require('./config/db')
const redisClient=require("./config/reddis")
const authRouter=require('./routes/userAuth')
const problemRouter=require('./routes/problemCreator')
const submitRouter=require('./routes/submit')
const aiRouter=require('./routes/aiChatting')
const videoRouter=require('./routes/videoCreator')
const cors=require('cors')

// solving cors issue
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))


app.use('/user',authRouter)
app.use('/problem',problemRouter)
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/video',videoRouter)

const InitializeConnection=async()=>{
    try{
        await Promise.all([main(),redisClient.connect()])
        console.log("connected to db")
        app.listen(process.env.PORT,()=>{
        console.log("server listening at port no:"+process.env.PORT)
     })
    }
    catch(err)
    {
        console.log("error occured"+err);
    }
}
InitializeConnection();

