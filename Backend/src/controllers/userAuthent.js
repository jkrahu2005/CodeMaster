const validate=require('../utils/validator')
const User=require('../models/user')
const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')
const redisClient = require('../config/reddis')
const Submission=require('../models/submission')
const register=async(req,res)=>{
    try{
        validate(req.body);
        
        const{firstName,emailId,password}=req.body;
        req.body.password=await bcrypt.hash(password,10);
        req.body.role='user';
        const user=await User.create(req.body);
        const token=jwt.sign({_id:user._id,emailID:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60})
        res.cookie('token',token,{maxAge:60*60*1000});
        const reply={
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id,
        role:user.role

    }
       res.status(201).json({
        user:reply,
        message:"user registered successfully"
    })


    }
    catch(err)
    {
        res.status(401).send("error occured:"+err);

    }
}
const login=async(req,res)=>{
    try{
    const{emailId,password}=req.body;
    if(!emailId)
        throw new Error("Invalid Credentials")
    if(!password)
        throw new Error("Invalid Credentials")
    const user= await User.findOne({emailId})
    const match=await bcrypt.compare(password,user.password)
    if(!match)
        throw new Error("password is incorrect")
    const reply={
        firstName:user.firstName,
        emailId:user.emailId,
        _id:user._id,
        role:user.role

    }
    const token=jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60})
    res.cookie('token',token,{maxAge:60*60*1000});
    res.status(201).json({
        user:reply,
        message:"logged in successfully"
    })
}
catch(err){
    res.status(401).send("Error ocuured"+err)
}

}
const logout=async(req,res)=>{
    try{
        const {token}=req.cookies;
        const payload=jwt.decode(token);
        await redisClient.set(`token:${token}`,'blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
        res.cookie("token",null,{expires:new Date(Date.now())});
        res.send("logged out successfully");

    }catch(err)
    {
        res.status(401).send("error occured:"+err);

    }
}
const adminRegister=async(req,res)=>{
try{
        validate(req.body);
        
        const{firstName,emailId,password}=req.body;
        req.body.password=await bcrypt.hash(password,10);
        req.body.role='admin';
        const user=await User.create(req.body);
        const token=jwt.sign({_id:user._id,emailID:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("user registerd successfully")


    }
    catch(err)
    {
        res.status(401).send("error occured:"+err);

    }
}
const DeleteProfile=async(req,res)=>{
    try{

        const userId=req.result._id;
        // deleting the user id of the user
        User.findByIdAndDelete(userId);
        // now deleting the problems solved by the user
        Submission.deleteMany({userId});
        res.status(200).send("deleted successfully");

    }
    catch(err)
    {
        // if there will be some error while executing the process
        res.status(500).send("Internal server error"+err);

    }

}
module.exports={register,login,logout,adminRegister,DeleteProfile}