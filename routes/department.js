const express = require('express');
const router= express.Router();
const authenticateUser= require('../middleware/middleware')
const multer= require('multer');
const path = require('path');
const complainModel = require('../models/complain')



const addDep= require("../controllers/department");
const getDep= require("../controllers/department");
const addDepWithUser= require("../controllers/department");


router.post("/addDep",addDep.addDep);
router.get("/getDep",getDep.getDep);
router.post("/addDepWithUser",addDepWithUser.addDepWithUser);


module.exports = router;