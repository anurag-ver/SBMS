const express = require('express');
const notFoundError = require('./middleware/404Handling');
const ApiError = require('./utils/ApiError');
const app = express()

app.use("/api/v1",require("./router"))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("",(req,res,next)=>{
  next(new ApiError(404,"Not Found"))
})

app.use(notFoundError)

module.exports = app