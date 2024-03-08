const mongoose = require('mongoose');


const schema = new mongoose.Schema({
    title:{type:String,required:true, default:""},
    department:{type:String,required:true, default:""},
    detail:{type:String,required:true, default:""},
    address:{type:String,required:true, default:""},
    attachment:{type:[String],required:false, default:""},
    userId:{type:mongoose.Schema.Types.ObjectId , ref: 'users', required:true},
    userCnic: { type: String, required: true }
})

module.exports = mongoose.model("complaints",schema);