
const express=require('express')
const Middleware=require('../middleware/userMiddleware')
const authRouter=express.Router();
const {register,login,logout,adminRegister,DeleteProfile}=require('../controllers/userAuthent');
const adminMiddleware = require('../middleware/adminMiddleware');

// Register
// login
// logout
// getprofile

authRouter.post('/register',register)
authRouter.post('/login',login)

// ✅ FIXED: Use the actual logout controller with middleware
authRouter.post('/logout', Middleware, logout)

authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.post('/deleteProfile',Middleware,DeleteProfile)

authRouter.get('/check',Middleware,(req,res)=>{
    try{
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }
    res.status(201).json({
        user:reply,
        message:"Valid User"
    })
} catch(err)
{
    res.status(500).send("Internal Server Error while authenticating")
}
})
module.exports=authRouter;
