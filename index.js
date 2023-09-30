import express  from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import user from './routes/userRoute.js'
import passport from "./middleware/passport.js"
import session from 'express-session'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(user)

app.use(session({
    secret: process.env.JWT_SECRET,
    resave:false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())




const port = process.env.PORT ||3000
const db = process.env.DB_URL

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('connected to MongoDB')
})


app.listen(port, ()=>{
    console.log(`Server is listening on ${port}`)
})

 