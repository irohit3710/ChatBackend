const mongoose = require("mongoose");
const colors = require("colors");

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);

//     console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
//   } catch (error) {
//     console.error(`Error: ${error.message}`.red.bold);
//     process.exit(1); // Exit with a non-zero status code to indicate an error
//   }
// };

const connectDB = async ()=>{
  try{
      const connect = await mongoose.connect(process.env.MONGO_URI);
      console.log("Database Connected")
  }
  catch(err){
      console.log("Server is not connected to Database : ",err);
  }
}
module.exports = connectDB;

