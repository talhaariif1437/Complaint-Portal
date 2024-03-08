const express = require('express');
const router= express.Router();
const authenticateUser= require('../middleware/middleware')
const multer= require('multer');
const path = require('path');
const complainModel = require('../models/complain')

const storage =multer.diskStorage({
    destination: function(req,file,cb){
      cb(null, './uploads/');
    },
    filename: function(req,file,cb){
      cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
  })

const fileFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') ){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

const upload= multer({storage:storage,
limits:{
    filesize: 1024 * 1024 * 100
},
fileFilter: fileFilter
})



const regComplain= require("../controllers/complain");
const getAllComplains= require('../controllers/complain');
const getComplain= require("../controllers/complain");
const delComplain= require('../controllers/complain');
const deleteComplain= require('../controllers/complain');





router.post("/regComplain" ,upload.array('attachment',10),authenticateUser, regComplain.regComplain);
router.get("/getAllComplains/:id",authenticateUser, getAllComplains.getAllComplains);
router.get("/getComplain",authenticateUser,getComplain.getComplain);
router.delete("/delComplain",authenticateUser,delComplain.delComplain);
router.delete("/deleteComplain/:id",authenticateUser,deleteComplain.deleteComplain);




module.exports = router;