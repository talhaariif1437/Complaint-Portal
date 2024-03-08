const authModel = require("../models/auth");
const complainModel=require("../models/complain");
const bcrypt = require("bcrypt");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const authenticateUser= require('../middleware/middleware')


exports.user_signup = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, newPassword, confirmPassword,phoneNumber,address,dob,cnicNumber } = req.body;

    if (!name) {
      return res.status(400).send({ error: true, message: "Name is required" });
    }
    if (!email) {
      return res.status(400).send({ error: true, message: "Email is required" });
    }
    if (!phoneNumber) {
      return res.status(400).send({ error: true, message: "Phone Number is required" });
    }
    if (!cnicNumber) {
      return res.status(400).send({ error: true, message: "CNIC Number is required" });
    }
    if (!address) {
      return res.status(400).send({ error: true, message: "Address is required" });
    }
    if (!dob) {
      return res.status(400).send({ error: true, message: "Date of Birth is required" });
    }
    if (!newPassword) {
      return res  .status(400) .send({ error: true, message: "New password is required" });
    }
    if (!confirmPassword) {
      return res
        .status(400)
        .send({ error: true, message: "Confirm password is required" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .send({
          error: true,
          message: "New Password and Confirm Password not matched",
        });
    }

    // email is already registered
    const existingEmail = await authModel.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .send({ error: true, message: "Email  already registered" });
    }
    const existingCnic = await authModel.findOne({ cnicNumber });
    if (existingCnic) {
      return res
        .status(400)
        .send({ error: true, message: " CNIC Number already registered" });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    // Save user to database
    await authModel.create({ name, email, password: hashPassword,phoneNumber,address,dob,cnicNumber });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: true, message: "User registration failed" });
  }
  res
    .status(200)
    .send({ error: false, message: "User registered successfully" });
};

exports.user_login = async (req, res) => {
  try {
    const { email, password,cnicNumber } = req.body;

    if (!email)
      return res.status(400)
        .send({ error: true, message: "Email is required" });

    if (!password)
      return res.status(400)
        .send({ error: true, message: "Password is required" });
    if (!cnicNumber)
      return res.status(400)
        .send({ error: true, message: "CNIC Number is required" });

    let user = await authModel.findOne({ email: email , cnicNumber:cnicNumber}).catch((err) => {
      console.log(err);
    });
    if (user) {
      let result = await bcrypt .compare(password, user.password)
        .catch((err) => {
          console.log(err);
        });

      let payload = {
        email: user.email,
        cnicNumber: user.cnicNumber,
        _id: user._id
      };

      if (result) {
        let token = jwt.sign(payload, process.env.JWT_SECRET ,{ expiresIn: '1h'});
        if(token)
            return res.status(200).send({error:false, message: "Login Successful", token: token, name: user.name});
        return res.status(401).send({error:true, message: "Something went wrong"});         
      }
      return res.status(401).send({error:false, message: "Password not matched"});
    }
    return res.status(401).send({error:false, message: "User not found"}); 
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: true, message: "User Login failed" });
  }
};

exports.sendCode = async(req,res) => {
try{
    let email = req.body.email;

if(!email)
   return res.status(201).send({error: true, message: "Enter email!"});

   //Check Email exists in DB or Not
   let user =  await authModel.findOne({email: email});
if(!user)
   return res.status(404).send({error: true, message: "Email not found!"});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "talhaarif.qwertyexperts@gmail.com",
        pass: "tpyz aekv cxca zwtp"
    }
});

let code = Math.round(Math.random() *1000000);
while(1){
    if(code.toString().length <6){
        code *=10;
    }else{
        break;
    }
};


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
       return res.status(200).send({error: false , message: "Code sent successfully"});
}
return res.status(201).send({error: true , message: "Code not sent. Try again later"});

}    


catch (error) {
    console.log(error);
    return res.status(500).send({ error: true, message: "Try again!" });
  }

}


exports.verifyCode = async (req, res) => {
  let code = req.body.code;
  let email = req.body.email;

  if(!email)
      return res.status(201).send({error: true, msg: "Something went wrong. Please refresh and try again"});
  if(!code)
      return res.status(201).send({error: true, msg: "Code is required"});

  let user = await authModel.findOne({email: email}).catch(err => console.log(err));
  if(user){
      let givenTime = new Date(user.resetCodeTime).getTime();
      if(Date.now() < givenTime+(60*60*1000)){
          if(user.resetCode===code){
              await authModel.updateOne({email: email}, {resetCode: "", resetCodeTime: null}).catch(err => console.log(err));
              return res.status(200).send({error: false, msg: "Code matched successfully"});
          }else
              return res.status(201).send({error: true, msg: "Code not matched"});
      }else
          return res.status(201).send({error: true, msg: "Code Expired. Refresh and try again"});
  }else
      return res.status(201).send({error: true, msg: "User not found. Refresh and try again"});
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
  
let user = await authModel.findOne({email:email}).catch(err => console.log(err));

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
    let user = await authModel.findOne({ email: email }).catch((err) => console.log(err));

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
