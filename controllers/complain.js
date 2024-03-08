const authModel = require("../models/auth");
const complainModel=require("../models/complain");
// const { response } = require("express");
const jwt = require("jsonwebtoken");
const authenticateUser= require('../middleware/middleware')



exports.regComplain = async (req, res) => {
  let { title, detail, address, department } = req.body;
  let attachments = req.files.map((file) => file.path);
  
  try {
      // Validate required fields
      if (!title) {
          return res.status(400).send({ error: true, msg: "Complaint Title is required" });
      }
      if (!detail) {
          return res.status(400).send({ error: true, msg: "Complaint detail are required" });
      }
      if (!address) {
          return res.status(400).send({ error: true, msg: "Address is required" });
      }
      if (!department) {
          return res.status(400).send({ error: true, msg: "Department is required" });
      }

      // If all required fields are provided, proceed to create the complaint
      const userId = req.user._id; 
      const userCnic = req.user.cnicNumber;
      
      const complain = await complainModel.create({
          title,
          department,
          detail,
          address,
          userId, 
          userCnic,
          attachment: attachments
      });

      // If complaint creation is successful, send success response
      res.status(200).send({ msg: "Complaint registered successfully" });
  } catch (err) {
      // Handle database-related errors
      console.error(err);
      res.status(500).send({ error: true, msg: "Failed to register complaint" });
  }
};

  
  exports.getAllComplains =async(req,res)=>{
    const userCnic=req.params.id
  
    try{
      const complain = await complainModel.find({userCnic})
      if( complain.length === 0 ){
        return res.status(404).send({msg: "Complain not found"})
      }
      res.status(200).send({complain})
    }
    catch(err) {
      res.status(500).send({ error: true, msg:"Internal Server Error" });
    }
  }
  
  
  exports.getComplain = async(req,res)=>{
     try{
      const userId = req.user._id;   
      const complain = await complainModel.find({ userId: userId})
        if(complain.length>0){
        res.status(200).json(complain);
        }
        else{
          return res.status(404).send({ error: true, msg: "Complaint not found for this id" });
        }
      
     }
     catch(err){
      res.status(500).send({ error: true, msg:"Internal Server Error" });
     }
  }
  
  //Del 1 complain of the user
  exports.delComplain = async (req, res) => {
    try {
      let userId = req.user._id; 
      let complain = await complainModel.findOneAndDelete({ userId: userId });
      if (!complain) {
        return res.status(404).send({ error: true, msg: "Complaint not found for this id" });
      }
      return res.status(200).send({ error: false, msg: "Complaint deleted successfully"});
    } catch (err) {
      return res.status(500).json({ error: true, msg: "Internal Server Error" });
    }
  };
  
  //Del the specific complain of the user
  exports.deleteComplain = async(req,res)=>{
    try{
      const userId= req.user._id;
      const complainId= req.params.id;

      const complain= await complainModel.findOneAndDelete({_id: complainId, userId: userId});
      if(! complain){
        return res.status(404).json({error:true, msg:"Complaint not found for this user."});
      }
      return res.status(200).json({error:false, msg:"Complaint deleted successfully"  })
    }
    catch(err){
        return res.status(500).send({error:true, msg:"Internal Server Error"})
    };
}