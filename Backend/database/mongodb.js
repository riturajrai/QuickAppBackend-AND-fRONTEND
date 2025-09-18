const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("mongo db successfully completed")
}).catch((error)=>{
    console.error(error , "mongodv connection error")
});

  