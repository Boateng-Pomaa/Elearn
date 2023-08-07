import mongoose from "mongoose"

const {Schema, model} = mongoose


const answers = new Schema({
  content: {String},
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'posts' },
  username:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', required: false
},
upvote:[{type:String}],
    downvote:[{type:String}]
})


export const answersModel = model("answer",answers)