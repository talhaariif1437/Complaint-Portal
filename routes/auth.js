const express = require('express');
const router= express.Router();
const authenticateUser= require('../middleware/middleware')
const multer= require('multer');
const path = require('path');
const complainModel = require('../models/complain')


const signup = require('../controllers/auth');
const login = require('../controllers/auth');
const forgotPassword= require('../controllers/auth');
const verifyCode = require('../controllers/auth');
const resetPassword = require('../controllers/auth');
const changePassword = require('../controllers/auth');




router.post("/signup", signup.user_signup);
router.post("/login", login.user_login);
router.post("/forgotPassword", forgotPassword.sendCode);
router.post("/verifyCode", verifyCode.verifyCode);
router.post('/resetPassword', resetPassword.resetPassword);
router.patch('/changePassword',authenticateUser, changePassword.changePassword);


module.exports = router;