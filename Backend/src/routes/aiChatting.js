const express=require('express');
const aiRouter=express.Router();
const userrMiddleware=require('../middleware/userMiddleware')
const solveDoubt=require('../controllers/solveDoubt')

aiRouter.post('/chat',userrMiddleware,solveDoubt)

module.exports=aiRouter