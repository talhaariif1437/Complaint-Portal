const express = require('express');
const router= express.Router();
const authenticateUser= require('../middleware/middleware')


const signup = require('../controllers/auth');
const login = require('../controllers/auth');
const forgotPassword= require('../controllers/password');
const verifyCode = require('../controllers/password');
const resetPassword = require('../controllers/password');
const changePassword = require('../controllers/password');




router.post("/signup", signup.userSignup);  
router.post("/login", login.userLogin);
router.post("/forgotPassword", forgotPassword.sendCode);
router.post("/verifyCode", verifyCode.verifyCode);
router.post('/resetPassword', resetPassword.resetPassword);
router.patch('/changePassword',authenticateUser, changePassword.changePassword);


module.exports = router;