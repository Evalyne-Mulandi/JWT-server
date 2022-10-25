const express= require('express')
const cors= require('cors')
const bodyParser =require('body-parser')
const register=require('./model/db')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const bcrypt=require('bcryptjs')
const port=3000
const app=express()
app.use(bodyParser.json())
app.use(cors())
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
        res.status(200).send({message:"welcome!!"})
    }
}
})




 app.listen (port,(req,res)=>{
    console.log('listening on port '+ port);
 })

