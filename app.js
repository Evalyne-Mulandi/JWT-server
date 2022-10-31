const express= require('express')
const cors= require('cors')
const bodyParser =require('body-parser')
const jwt = require("jsonwebtoken")
const register=require('./model/db')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cookieParse=require('cookie-parser')
const bcrypt=require('bcryptjs')
 
const port=3000
const app=express()
app.use(bodyParser.json())
app.use( cookieParse())
app.use(cors({
    credentials:true,
    origin:[ "http://localhost:3000" ,"http://localhost:8080"]
}     
))
dotenv.config()
mongoose.connect(process.env.MONGO_URL,()=>{
    console.log("Connected to db");
})
app.get('/',(req,res)=>{
    res.send('homepage')
})
app.post('/register',async(req,res)=>{
    const emailExist=await register.findOne({Email:req.body.Email})
    let value=await req.body.password
   /*  if(value !=req.body.confirmPassword){
        res.status(400).send({message:"password doesn't match"})
       
    }
    else  */
    if(emailExist){
        res.status(400).send({message:"Email already exist"})

    }

    else{
       try {
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(req.body.password, salt)
        let user=new register({
            fullName:req.body.fullName,
            Email:req.body.Email,
            password:hashedPassword,
            
        })
        let savedUser=await user.save()
        
        const{password, ...data}=await savedUser.toJSON()
      /*    res.send(data )   */

        res.send({message:"account created"}) 
       } catch (error) {
        res.status(500).send(error)
       }
    }
})

 




/* LOGIN */
app.post("/login",async (req,res)=>{
/* checking if email exist */
const userdt= await register.findOne({Email:req.body.Email})

if(!userdt){
    return res.status(400).json({message:"User is not found!"})
}else{
    //validation if password is correct
    const validatePassword=await bcrypt.compare(req.body.password,userdt.password)
    if(!validatePassword){
        return res.status(400).send({message:"email or password is wrong"})
    }else{
        const token = jwt.sign({ _id: userdt._id }, "secret");
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 100, //i day
        });
     return res.send({
        message:"success"
     })
    }
}

})

app.get('/user',async(req,res)=>{
    try{ 
    const cookie= req.cookies;
   const claims= jwt.verify(cookie.jwt,'secret')
   if(!claims){
     res.status(401).json({message:"  you are not signed in"})
   }else{
       const  user= await register.findOne({_id: claims._id})
       const{password, ...data}=await user.toJSON()
        return res.status(200).send(data) 
   }
}catch(error){
    console.log(error);
    return res.status(500).send({message:"You aren't signed in"})
}
})
app.post('/logout',async(req,res)=>{
     res.cookie("jwt","",{maxAge:0})
     res.send({message:"you logged out"})
})
 



 app.listen (port,(req,res)=>{
    console.log('listening on port '+ port);
 })

