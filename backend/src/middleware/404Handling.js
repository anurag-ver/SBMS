const ApiError = require("../utils/ApiError")

const notFoundError = (err,req,res,next)=>{
    const error_obj={
        code:500,
        msg:err.message,
        stack:err.stack
    }
    if(err instanceof ApiError){
        error_obj.code = err.statuscode
    }
    res.status(error_obj.code).send(error_obj)
}

module.exports = notFoundError