const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    dname:{type: String, required: true,default: ""},
    description:{type: String, required: true, default:""},
    user:{type:mongoose.Schema.Types.ObjectId, ref: "users", required: true}
})

module.exports = mongoose.model("departments", schema);