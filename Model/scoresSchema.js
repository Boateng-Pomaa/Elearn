import mongoose from "mongoose"

const {Schema,model} = mongoose

const scores = new Schema({
    username:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', required: true
    },
    quiz:{
        type:String,
    },
    score:{
        type:Number
    }
})

export const scoreModel = model("scores",scores)