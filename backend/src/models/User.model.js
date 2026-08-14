const mongoose = require("mongoose")
const schema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lower:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    acc_type:{
        type:String,
        required:true,
        enum:["saving","current"],
        default:"saving"
    },
},{
    timestamps:true
})

const model = mongoose.model("user",schema)


exports.UserModel = model