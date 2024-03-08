const express = require('express');
const app = express();
const mongoose = require('mongoose');
const  cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
 
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_DRIVER).then((val) =>{
    console.log("Database connected");

}).catch((err)=>{
    console.log(err)
})



const authRouter = require('./routes/auth');
const complainRouter=require("./routes/complain")
app.use("/auth", authRouter)
app.use("/api/complain", complainRouter);
module.exports = app;