import { userModel } from '../Model/userSchema.js'
import {feedModel} from '../Model/feedSchema.js'
import * as bcrypt from "bcrypt"


export async function loginUser(req, res) {
    try {
        const { username, password } = req.body
        const user = await userModel.findOne({ username: username })
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                message: "Login successful",
                user
            })
        } else {
            res.status(400).json({
                message: 'Invalid Credentials'
            })

        }
    }
    catch (err) {
        console.error(err.message)
        res.status(500).json({
            message: 'server error'
        })
    }
}



export async function registerUser(req, res) {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                message: 'Please include all fields'
            })
        }

        // Find if user already exists
        const userExists = await userModel.findOne({ username })

        if (userExists) {
            return res.status(400).json({
                message: 'Account already exists'
            })
        }

        // CREATING USER
        const user = await userModel.create({
            username,
            password
        })
        if (user) {
            res.status(200).json({
                message: 'Registration Successful',
                user,
            })
        } else {
            res.status(400).json({
                message: "Registration unsuccessful"
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
}


//profile

export async function profile(req,res){
    try {
        const {id} = req.user
        const user =userModel.findById({id})

        if(user){
            res.status(200).json({
                message:"Success",
                user
            })
        }


    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server error')
    }
}



export async function feed(req,res){
try{
    const feeds = await feedModel.find()
    if (feeds){
        res.status(200).json({
            feeds
        })
    }else{
       return res.status(400).json({message:"Error Loading Feed"})
    }
}catch(error){
    console.log(error)
    return res.status(500).send('Internal Server Error')
}
}


export async function post(req,res){
    try{

    const {username} = req.user
    const {title,question} = req.body

    const posts = await feedModel.create({
        username,
        title,
        question
    })

    if(posts){
        return res.status(200).json({
            message:"Question Posted Successfully"
        })}
        else{
        return res.status(400).send('Failed To Post Your Question')
    }}catch(error){
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
}