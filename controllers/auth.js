const authModel = require("../models/auth");
const complainModel=require("../models/complain");
const bcrypt = require("bcrypt");
const { response } = require("express");
const jwt = require("jsonwebtoken");


exports.userSignup = async (req, res) => {
  try {
    const { name, email, newPassword, confirmPassword,phoneNumber,address,dob,cnicNumber } = req.body;

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
      return res
        .status(400)
        .send({ error: true, msg: "Confirm password is required" });
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

    // Save user to database
    await authModel.create({ name, email, password: hashPassword,phoneNumber,address,dob,cnicNumber });
    res.status(200).send({ error: false, msg: "User registered successfully" });
  }
   catch (error) {
    return res.status(500).send({ error: true, msg: "User registration failed" });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password,cnicNumber } = req.body;

    if (!email)
      return res.status(400)
        .send({ error: true, msg: "Email is required" });
    if (!password)
      return res.status(400)
        .send({ error: true, msg: "Password is required" });
    if (!cnicNumber)
      return res.status(400)
        .send({ error: true, msg: "CNIC Number is required" });

    let user = await authModel.findOne({ email, cnicNumber}).catch((err) => {
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
            return res.status(200).send({error:false, msg: "Login Successful", token: token, name: user.name});
        return res.status(401).send({error:true, msg: "Something went wrong"});         
      }
      return res.status(401).send({error:false, msg: "Password not matched"});
    }
    return res.status(401).send({error:false, msg: "User not found"}); 
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: true, msg: "User Login failed" });
  }
};
