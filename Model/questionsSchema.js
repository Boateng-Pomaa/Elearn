import mongoose from "mongoose"

const {Schema,model} = mongoose

const questions = new Schema({
    questionNumber:{
        type:Number,
        required:true
    },
    question:{
        type:String,
    },
    answers:{
        type:[String]
    }
})

export const questModel = model("Questions",questions)