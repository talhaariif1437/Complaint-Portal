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