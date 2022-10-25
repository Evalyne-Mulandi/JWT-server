const mongoose  = require("mongoose");
 
const Useschema=new mongoose.Schema({

fullName:{
    type:String,
    required:true,
},
 
Email:{
    type:String,
    required:true,
},
password:{
    type:String,
    required:true,
},
 



})
module.exports=mongoose.model('register',Useschema)