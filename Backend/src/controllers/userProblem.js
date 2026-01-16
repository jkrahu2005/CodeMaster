const {getLanguageById,submitBatch,submitToken}=require('../utils/problemUtility')
const Problem=require("../models/Problem")
const Submission = require('../models/submission');
const User=require("../models/user")
const solutionVideo=require("../models/solutionVideo")
const createProblem=async(req,res)=>{
  console.log("creating problem api is being hitted")
  
  const{title,description,difficulty,tags,visibleTestCases,hiddenTestCases,
    startCode,referenceSolution,problemCreator}
  =req.body;  
  try{
    for(const {language,completeCode} of referenceSolution)
    {
        // source code:
        // language_id:
        // stdin:
        //expected_output:
        const languageId=getLanguageById(language);
        const submissions=visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output


        }))
        
        const submitResult=await submitBatch(submissions);
        console.log(submitResult)
        const resultToken=submitResult.map((value)=>value.token);
        const testResult=await submitToken(resultToken)
        console.log(testResult);
       for (const test of testResult) {
  console.log("Judge0 Test Output:", test.stdout, "Expected:", visibleTestCases[testResult.indexOf(test)].output);
  console.log("Status:", test.status_id, test.status.description);

  if (test.status_id != 3) {
    return res.status(400).send("Reference solution failed test cases");
  }
}


    }
    const userProblem=await Problem.create({
      ...req.body,
      problemCreator:req.result._id
    })
    res.status(201).send("Problem saved successfully");


  }
  catch(err)
  {
    res.status(401).send("Error occured"+err)

  }
}
const updateProblem=async(req,res)=>{
  console.log('api hitted')
  const {id}=req.params;
  const{title,description,difficulty,tags,visibleTestCases,hiddenTestCases,
  startCode,referenceSolution,problemCreator}
  =req.body; 
  try{
    if(!id)
      return res.status(400).send("id is missing");
    const dsaproblem=await Problem.findById(id);
    if(!dsaproblem)
      return res.status(400).send("problem is missing")
    console.log('1')
    for(const {language,completeCode} of referenceSolution)
    {
        // source code:
        // language_id:
        // stdin:
        //expected_output:
        const languageId=getLanguageById(language);
        const submissions=visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output


        }))
        console.log('6')
        
        const submitResult=await submitBatch(submissions);
       
        const resultToken=submitResult.map((value)=>value.token);
        const testResult=await submitToken(resultToken)
        
        for(const test of testResult)
        {
          if(test.status_id!=3)
          {
            console.log('2');
            return res.status(400).send("Error Ocurred");
          }
        }

    }
    console.log('5');
    await Problem.findByIdAndUpdate(
  id,
  {
    ...req.body,
    problemCreator: req.result._id  // override the creator with logged-in admin
  },
  {
    runValidators: true,
    new: true
  }
);
console.log('3');

    res.status(200).send("Problem Updated successfully");

  }catch(err)
  {
    res.status(400).send("some error occured"+err)

  }
}

const deleteProblem=async(req,res)=>{
  const {id}=req.params;
  
  try{
    if(!id)
    return res.status(400).send("id is invalid");
  const dsaproblem=await Problem.findById(id);
  
  if(!dsaproblem)
    return res.status(400).send("problem is missing")
   const deletedproblem= await Problem.findByIdAndDelete(id);
  res.send(deletedproblem);

  }catch(err)
  {
    res.status(400).send("error ocuured"+err);

  }


}
const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) return res.status(400).send("ID is missing");

    const dsaproblem = await Problem.findById(id).select(
      "title description difficulty tags visibleTestCases startCode referenceSolution"
    );

    if (!dsaproblem)
      return res.status(404).send("Problem not found");

    // Convert to plain JS object
    const problemObj = dsaproblem.toObject();

    const video = await solutionVideo.findOne({ problemId: id });

    if (video) {
      problemObj.secureUrl = video.secureUrl;
      problemObj.cloudinaryPublicId = video.cloudinaryPublicId;
      problemObj.thumbnailUrl = video.thumbnailUrl;
      problemObj.duration = video.duration;
    }

    return res.status(200).json(problemObj);
  } catch (err) {
    return res.status(500).send("Server error: " + err.message);
  }
};

const getAllProblem = async (req, res) => {
  try {
    // console.log("giving problems")
    const problems = await Problem.find().select(
      "title description difficulty tags visibleTestCases"
    );

    res.status(200).json(problems);
  } catch (err) {
    res.status(500).send("Error occurred: " + err);
  }
};
const solvedProblem=async(req,res)=>{
  try{
    const userId=req.result._id
    const user=await User.findById(userId).populate({
      path:"problemSolved",
      select:"_id title difficulty tags"
    });
    res.send(user.problemSolved);

  }
  catch(err)
  {
    res.status(500).send("Internal Server Error");

  }
}
const submittedProblem=async(req,res)=>{
  try{
    const userId=req.result._id;
    const problemId=req.params.pid;
    const ans=await Submission.find({userId,problemId});
    // console.log(ans);
    if(ans.length==0)
      res.status(200).send("Noi submissions found");
    // console.log('2');
    res.status(200).send(ans);


  }
  catch(err)
  {
    res.send("Internal Server error while finding the submmisons");

  }
}

module.exports={createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblem,submittedProblem};