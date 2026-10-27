const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")

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

schema.pre("save" ,async function(next){
    const user = this;
    if(user.isModified("password")){
        this.password = await bcryptjs.hash(user.password,10)
    }
})

const model = mongoose.models.user || mongoose.model("user", schema);
if (!mongoose.models.User) {
    mongoose.model("User", schema);
}


exports.UserModel = model