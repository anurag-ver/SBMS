const { default: mongoose } = require("mongoose")
const { UserModel } = require("../models/User.model")
const ApiError = require("../utils/ApiError")
const bcryptjs = require("bcryptjs")
const JWTService = require("../utils/JwtService")


class AuthService{
    static async loginUser(body){
        const {email,password} = body
        const check_exist = await UserModel.findOne({email})
        if(!check_exist){
            throw new ApiError(400,"No Account Found")
        }
        const isMatch = await bcryptjs.compare(password,check_exist.password)
        if(!isMatch){
            throw new ApiError(400,"Invalid Credential")
        }

        const token = JWTService.generateToken(check_exist._id)
        return{
            msg:"Login Success",
            "token":token
        }
    }

    static async registerUser(body){
        const {name,email,password,acc_type}=body

        const check_email = await UserModel.findOne({email:email.toLowerCase()})
        if(check_email){
            throw new ApiError(400,"Email Already Exists")
        }
            const user = await UserModel.create({
                name,email,password,acc_type
                })
                return {
                    msg:"Register Success",
                    "token":"123"
            }
    }

    static async profileUser(userId){
        const user = await UserModel.findById(userId).select("name email acc_type createdAt -_id")
        if(!user){
            throw new ApiError(401,"Profile Not Found")
        }
        return user
    }
}

module.exports = AuthService