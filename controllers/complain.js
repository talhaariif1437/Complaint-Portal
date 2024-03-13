const authModel = require("../models/auth");
const complainModel=require("../models/complain");
const departmentModel= require("../models/department");
// const { response } = require("express");
const jwt = require("jsonwebtoken");
const authenticateUser= require('../middleware/middleware');
const bcrypt = require('bcrypt');


//Add Departments
exports.addDep = async(req,res)=>{
try{
  const {name,description} = req.body;
  const department =  new departmentModel({name,description});
  await department.save();
  return res.status(200).json({message:"Department added successfully", department});
}
catch(err){
  res.status(500).send({error: err, message:"Internal server error"});
}

}


//Add Departments and New User's id stored in the table
exports.addDepWithUser = async(req,res)=>{
  const {dname,description,user} = req.body;
  const {name,email,cnicNumber,address,phoneNumber,dob,newPassword,confirmPassword} = user;
try{
  // user reg
  if (!name) {
    return res.status(400).send({ error: true, msg: "Name is required" });
  }
  if (!email) {
    return res.status(400).send({ error: true, msg: "Email is required" });
  }
  if (!phoneNumber) {
    return res.status(400).send({ error: true, msg: "Phone Number is required" });
  }
  if (!cnicNumber) {
    return res.status(400).send({ error: true, msg: "CNIC Number is required" });
  }
  if (!address) {
    return res.status(400).send({ error: true, msg: "Address is required" });
  }
  if (!dob) {
    return res.status(400).send({ error: true, msg: "Date of Birth is required" });
  }
  if (!newPassword) {
    return res  .status(400) .send({ error: true, msg: "New password is required" });
  }
  if (!confirmPassword) {
    return res.status(400).send({ error: true, msg: "Confirm password is required" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).send({error: true,msg: "New Password and Confirm Password not matched",
      });
  }
  
  // email is already registered
  const existingUser = await authModel.findOne( {$or :[{email},{cnicNumber}] });
  if (existingUser) {
    if(existingUser.email === email){
      return res.status(400).send({ error: true, msg: "Email  already registered" });
    }else{
      return res.status(400).send({ error: true, msg: "Cnic Number  already registered" });
    }
  }
  
  const saltRounds = 10;
  const hashPassword = await bcrypt.hash(newPassword, saltRounds);
  
  const  newUser = new authModel({name,email,password:hashPassword,address,cnicNumber,dob,phoneNumber})
  await newUser.save();

  //user reg ends

  const department =  new departmentModel({dname,description, user: newUser._id});
  console.log(department);
  await department.save();
  return res.status(200).json({message:"Department added successfully", department});
}
catch(err){
  res.status(500).send({error: err, message:"Internal server error"});
}

}

//Get Departments
exports.getDep= async(req,res)=>{
  try{
    const departments =  await departmentModel.find();
    return res.status(200).json({message:"Here are departments ", departments});
  }
  catch(err){
    res.status(500).send({error: err, message:"Internal server error"});
  }
}

exports.regComplain = async (req, res) => {
  let { title, detail, address ,departmentId} = req.body;
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
    if (!departmentId) {
      return res.status(400).send({ error: true, msg: "Department Id is required" });
    }
    
    const department =  await departmentModel.findById(departmentId);
    if(!department) {
      return res.status(400).send({ error: true, msg: "Department not found" });
    }  
    console.log(address) ;
    console.log(departmentId)  ;

      const userId = req.user._id; 
      const userCnic = req.user.cnicNumber;
      
      const complain = await complainModel.create({
          title,
          departmentId,
          detail,
          address,
          userId, 
          userCnic,
          attachment: attachments
      });
      res.status(200).send({ msg: "Complaint registered successfully",complain });
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


//Get All the Complains details with the users details

exports.allComplainsDetails= async(req, res, next)=>{
  try{
    const complains= await complainModel.find().populate('userId');

    if(!complains || !complains.length === 0 ){
      return res.status(404).json({error:true, msg:"No complains found"});
    }
    res.status(200).json(complains)
  }
  catch(err){
    res.status(500).send({error:true, msg:"Internal Server Error"})
  }
}