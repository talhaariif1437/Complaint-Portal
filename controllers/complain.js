const authModel = require("../models/auth");
const complainModel=require("../models/complain");
// const { response } = require("express");
const jwt = require("jsonwebtoken");
const authenticateUser= require('../middleware/middleware')



exports.regComplain = async (req, res) => {
  const { title, detail, address, department } = req.body;
  const attachments = req.files.map((file) => file.path);

  try {
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
      res.status(200).send({ msg: "Complaint registered successfully" });
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: true, msg: "Failed to register complaint" });
  }
};

  //Get complains by Cnic number
exports.getAllComplains = async (req, res) => {
  const userCnic = req.params.id;

  try {
      const complains = await complainModel.find({ userCnic });

      if (!complains || complains.length === 0) {
          return res.status(404).send({ msg: "Complaint not found" });
      }

      return res.status(200).send({ complains });
  } catch (error) {
      console.error(error);
      return res.status(500).send({ error: true, msg: "Internal Server Error" });
  }
};


  // get complain by user _id
  exports.getComplain = async(req,res)=>{
     try{
      const userId = req.user._id;   
      const complains = await complainModel.find({ userId})   
            if(!complains){
              return res.status(404).send({ error: true, msg: "Complaint not found for this id" });
            }  
             res.status(200).json({complains});
      
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