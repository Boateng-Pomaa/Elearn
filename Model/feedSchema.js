import mongoose from 'mongoose'


const {Schema,model} = mongoose


const feedSchema = new Schema({
    username:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', required: false
    },
    title:{
       type: String,
       required:true
    }
    ,
    question:{
        type:String,
        required:true
    },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'answer' }],
    upvote:[{type:String}],
    downvote:[{type:String}]
    }
)

export const feedModel = model('posts',feedSchema)