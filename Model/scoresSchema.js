import mongoose from "mongoose"

const {Schema,model} = mongoose

const scores = new Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', required: true
    },
    score:{
        type:Number
    },
    quiz:{
        type:String,
    }
},
{
    timestamps: true
})

export const scoreModel = model("scores",scores)