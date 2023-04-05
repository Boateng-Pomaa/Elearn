import {userModel} from '../Model/userSchema.js'
import * as bcrypt from "bcrypt"


export async function loginUser(req,res){
    try {
        const {username, password} = req.body
        const user = await userModel.findOne({username:username})
        if(user &&(await bcrypt.compare(password, user.password)))
           {
             res.status(401).json({
                    message:"Login successful",
                    user
                })
            }else{
                res.status(400).json({
                    message:'Invalid Credentials'
                })

            }
        }
     catch (err) {
        console.error(err.message)
        res.status(500).json({
            message:'server error'
        })
    }
}



export async function registerUser(req,res){
    const {username, password} = req.body;

    // Validation
  if (!username || !password ) {
    res.status(400).json({
        message:'Please include all fields'})
  }

  // Find if user already exists
  const userExists = await userModel.findOne({ username })

  if (userExists) {
    res.status(400).json({
        message:'Account already exists'})
  }

  // CREATING USER
    const user = await userModel.create({
        username,
        password
    })
    if (user){
        res.status(200).json({
            message:'Registration Successful',
            user,
        })
    }else{
        res.status(400).json({
            message:"Registration unsuccessful"
        })
    }
}



