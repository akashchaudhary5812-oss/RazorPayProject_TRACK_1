const mongoose = require('mongoose');

async function connectDB(){
      try{
         await mongoose.connect(process.env.MONGODB_URI);
         console.log("MongoDB is Connected!!");
      }
      catch(e){
        console.log("Error Occured While Connecting Database");
        process.exit(1);
      }
}

module.exports = connectDB;