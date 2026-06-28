const jwt=require('jsonwebtoken')
const User=require('../models/user');
const redisClient = require('../config/reddis');

const adminMiddleware=async(req,res,next)=>{
    
    try{
        // console.log(1);
        const {token}=req.cookies;
        if(!token)
            throw new Error("Token is not present")
        const payload= jwt.verify(token,process.env.JWT_KEY)
        const {_id}=payload;
        console.log(token)
        if(!_id)
            throw new Error("Invalid token")
        const result=await User.findById(_id);
        // console.log(result);
        // console.log(payload.role);
        if(payload.role!='admin')
            throw new Error("Invalid Token")
        if(!result)
            throw new Error("User does not exist")
        // redis ke blocklist mein present to nahi hai
        const IsBlocked=await redisClient.exists(`token:${token}`);
        // console.log(IsBlocked)
        if(IsBlocked)
            throw new Error ("Invalid Token")
        req.result=result;
        next();


    }
    catch(err)
    {
        res.status(401).send("error ocuured:"+err)

    }
}
module.exports=adminMiddleware;