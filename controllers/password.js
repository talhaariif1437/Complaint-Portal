const authModel = require("../models/auth");
const complainModel=require("../models/complain");
const bcrypt = require("bcrypt");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');



exports.sendCode = async(req,res) => {
    try{
        let email = req.body.email;    
    if(!email)
       return res.status(201).send({error: true, msg: "Enter email!"});
    
       let user =  await authModel.findOne({email});
    if(!user)
       return res.status(404).send({error: true, msg: "User not found!"});
    
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "talhaarif.qwertyexperts@gmail.com",
            pass: "tpyz aekv cxca zwtp"
        }
    });
    
    const code = Math.floor(Math.random() * 1000000).toString().padStart(8, '7');
 
    let result = await transporter.sendMail({
        from: "talhaarif.qwertyexperts@gmail.com",
        to: email,
        subject: "Verification Code from Talha",
        text:" Your verification code is:  " +code   
    });
    
    if(result){
        let result = await authModel.updateOne({email: email}, {resetCode: code, resetCodeTime: Date.now() })
        .catch((err)=>{console.error(err)});
    
        if(result.modifiedCount >0)
           return res.status(200).send({error: false , msg: "Code sent successfully"});
    }
    return res.status(201).send({error: true , msg: "Code not sent. Try again later"});
    
    }    
    
    catch (error) {
        console.log(error);
        return res.status(500).send({ error: true, msg: "Try again!" });
      }    
    }
    
    
exports.verifyCode = async (req, res) => {
      let {code, email} = req.body;
    
      if(!email)
          return res.status(201).send({error: true, msg: "Something went wrong. Please refresh and try again"});
      if(!code)
          return res.status(201).send({error: true, msg: "Code is required"});
    
      let user = await authModel.findOne({email}).catch(err => console.log(err));
      if(user){
          let givenTime = new Date(user.resetCodeTime).getTime();
          if(Date.now() < givenTime+(60*60*1000)){
              if(user.resetCode===code){
                  await authModel.updateOne({email}, {resetCode: "", resetCodeTime: null}).catch(err => console.log(err));
                  return res.status(200).send({error: false, msg: "Code matched successfully"});
              }else
                  return res.status(201).send({error: true, msg: "Code not matched"});
          }else
              return res.status(201).send({error: true, msg: "Code Expired. Refresh and try again"});
      }else
          return res.status(401).send({error: true, msg: "User not found. Refresh and try again"});
    }
    
exports.resetPassword = async(req,res,next) =>{
      let {newPassword, confirmPassword, email} = req.body;
      if (!newPassword || !confirmPassword || !email) {
        return res.status(400).send({ error: true, msg: "All fields are required" });
      }
    
     if(newPassword !== confirmPassword){
      return res.status(400).send({error: true, msg: "New Password does not match with confirm password"});
     }
    
    try{
      
    let user = await authModel.findOne({email}).catch(err => console.log(err));
    
    if(!user){
    return res.status(404).send({error: true, msg: "User not found"})
    }
    
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    
    let saltRounds= 10;
    const hashPassword = await bcrypt.hash(newPassword, saltRounds)
    
    user.password = hashPassword;
    
    await user.save();
    return res.status(200).send({error: false, msg: "Password reset successful"})
    
    }
    catch(err){
      console.log(err);
      return res.status(401).send({error: true, msg:"Internal server error"});
    }
      } 
    
    exports.changePassword = async (req, res) => {
      let { oldPassword, newPassword, confirmPassword, email } = req.body;
    
      if (!oldPassword || !newPassword || !confirmPassword || !email) {
        return res.status(400).send({ error: true, msg: "All fields are required" });
      }
    
      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .send({ error: true, msg: "New Password does not match with confirm password" });
      }
    
      try {
        let user = await authModel.findOne({ email }).catch((err) => console.log(err));
    
        if (!user) {
          return res.status(404).send({ error: true, msg: "User not found" });
        }
    
        // Check  old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
    
        if (!isMatch) {
          return res.status(401).send({ error: true, msg: "Old password is incorrect" });
        }
    
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(newPassword, saltRounds);
    
        // Update user's password
        user.password = hashPassword;
    
        await user.save();
    
        return res.status(200).send({ error: false, msg: "Password changed successfully" });
      } catch (err) {
        return res.status(500).send({ error: true, msg: "Internal server error" });
      }
    };
    