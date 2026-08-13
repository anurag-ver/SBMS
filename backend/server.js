const{config} = require("dotenv")
config({
  path: '.env'
})

const port = process.env.PORT || 8000

const app = require("./src/app")

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})