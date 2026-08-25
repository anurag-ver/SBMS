const { body } = require("express-validator")

class AuthValidation{
    static loginUser=[
        body("email").notEmpty().withMessage("Email Is Required").toLowerCase(),
        body("password").notEmpty().withMessage("Password Is Required"),
    ]
    static registerUser=[
        body("name").notEmpty().withMessage("Name Is Required"),
        body("email").notEmpty().withMessage("Email Is Required").toLowerCase(),
        body("password").notEmpty().withMessage("Password Is Required"),
        body("acc_type").notEmpty().withMessage("Account Type Is Required").isIn(["saving","current"]).withMessage("Account Should Be A Valid Saving Or Current Account")
    ]
}

module.exports = AuthValidation