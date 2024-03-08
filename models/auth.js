const mongoose = require('mongoose');

const schema  = new mongoose.Schema({
 name: {type: String , required: true, default:""},
 email: {type: String, required: true, default:""},
 password:{type: String, required: true, default:""},
 cnicNumber: {type: String, required: true, default:""},
 phoneNumber:{type: String, required: true, default:""},
 address: {type: String, required: true, default:""},
 dob:{type: Date, required: true, default:""},
 isVerified: {type: Boolean , required: false, default: false},
 resetCode: { type:String, required: false, default: null},
 resetCodeTime: {type:Date,required:false, default: null},
}, {timestamps: true});

module.exports = mongoose.model("users", schema);