const express=require('express');
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblem,submittedProblem}=require('../controllers/userProblem')
const problemRouter=express.Router();
const adminMiddleware=require('../middleware/adminMiddleware')
const userMiddleware=require("../middleware/userMiddleware")
//create
problemRouter.post('/create',adminMiddleware,createProblem);
problemRouter.patch("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);
// // fetchproblems
problemRouter.get('/problemById/:id',userMiddleware,getProblemById);
problemRouter.get('/getAllProblem',userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedProblem)
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);

module.exports=problemRouter;