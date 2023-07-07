import mongoose from 'mongoose'


const {Schema,model} = mongoose


const feedSchema = new Schema({
    username:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', required: true
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
    timestamp:true
})

export const feedModel = model('posts',feedSchema)