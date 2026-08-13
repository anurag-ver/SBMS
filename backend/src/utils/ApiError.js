class ApiError extends Error{
    constructor(code,msg){
        super(msg)
        this.statuscode=code
    }
}
module.exports = ApiError