import mongoose from "mongoose"

const {Schema, model} = mongoose


const answers = new Schema({
  content: {type:String,
    required:true
  },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'posts',required:true },
  username:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', required: true
},
upvote:{type:Number,
  default:0
}   
},
{
    timestamps: true
}
)


export const answersModel = model("answers",answers)