const mongoose = require("mongoose")
exports.ConnectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`DB is connected with ${mongoose.connection.host}` );
        
    }catch(error) {
        console.log("MongoDB Connection Error:", error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
    
    // catch(error){
    //     mongoose.disconnect()
    //     process.exit(1)
    // }

}