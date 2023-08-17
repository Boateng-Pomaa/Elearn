import { userModel } from '../Model/userSchema.js'
import { feedModel } from '../Model/feedSchema.js'
import { answersModel } from '../Model/answersSchema.js'
import * as bcrypt from "bcrypt"
import dotenv from 'dotenv'
import jwt from "jsonwebtoken"

dotenv.config()

export async function loginUser(req, res) {
    try {
        const { username, password } = req.body
        const user = await userModel.findOne({ username })
        if (user && (await bcrypt.compare(password, user.password))) {

            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            })
            user.token = token

            return res.status(200).json({
                message: "Login successful",
                user
            })
        } else {
            return res.status(400).json({
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
        const { username, email, password } = req.body;

        // Validation
        if (!username || !password || !email) {
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

        const tokens = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        })
        // CREATING USER
        const user = await userModel.create({
            username,
            password,
            email,
            token: tokens
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

export async function profile(req, res) {
    try {
        const { id } = req.params
        const user = await userModel.findById({ id }).select('-password')
        if (user) {
            res.status(200).json({
                message: "Success",
                user
            })
        } else {
            return res.status(404).json({
                message: "Not Found"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server error')
    }
}


///load all posted questions
export async function feed(req, res) {
    try {
        const feeds = await feedModel.find({})
        if (feeds) {
            res.status(200).json({
                feeds
            })
        } else {
            return res.status(400).json({ message: "Error Loading Feed" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
}

///save posts
export async function post(req, res) {
    try {

        const { username } = req.params
        const { title, question } = req.body

        const posts = await feedModel.create({
            username,
            title,
            question
        })

        if (posts) {
            return res.status(200).json({
                message: "Question Posted Successfully"
            })
        }
        else {
            return res.status(400).send('Failed To Post Your Question')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
}


///searching for questions
export async function search(req, res) {
    try {
        const { keyword } = req.query
        const feed = await feedModel.find({
            $or: [
                { title: { $regex: `${keyword}`, $options: 'i' } },
                { description: { $regex: `${keyword}`, $options: 'i' } }
            ]
        })
        if (!feed) {
            return res.status(400).send("Unable to fetch data")
        }
        return res.status(200).json({ feed })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

////answering post
export async function answers(req, res) {
    try {
        const { id } = req.params
        const { content } = req.body
        const { questionId } = req.params

        const questExist = await feedModel.findById(questionId)
        if (!questExist) {
            return res.status(400).json({
                message: 'question not found'
            })
        }
        const newAnswer = await answersModel.create({ content, id })
        if (!newAnswer) {
            return res.status(400).json({
                message: 'Failed to record answer'
            })
        }
        return res.status(200).json({
            mesage: "Answer recorded!"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }

}



////individual questions
export async function yourQuestion(req, res) {
    try {
        const { id } = req.params
        const allQuestions = await feedModel.findOne({username: id }).populate({
            path:'feeds',
            select:'-answers -updatedAt'
        })
        if (!allQuestions) {
            return res.status(400).json({
                message: 'Failed to load questions'
            })
        } else {
            return res.status(200).json({
                mesage: "success",
                allQuestions
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

/// individual answers
export async function yourAnswer(req, res) {
    try {
        const { id } = req.user
        const allAnswers = await answersModel.findById({ id })
        if (!allAnswers) {
            return res.status(400).json({
                message: 'Failed to load answers'
            })
        } else {
            return res.status(200).json({
                mesage: "success",
                allAnswers
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}


//upvote
export async function upvoteQuestion(req, res) {
    try {
        const { questionId } = req.params
        const upvote = await feedModel.findOneAndUpdate({ questionId }, { $inc: { upvote: 1 } }, { upsert: true })
        if (!upvote) {
            return res.status(400).json({
                message: 'Failed to upvote question'
            })
        } else {
            return res.status(200).json({
                mesage: "success"
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}


//downvote questions
export async function downVoteQuestion(req, res) {
    try {
        const { questionId } = req.params
        const downvote = await feedModel.findOneAndUpdate({ questionId }, { $dec: { downvote: 1 } }, { upsert: true })
        if (!downvote) {
            return res.status(400).json({
                message: 'Failed to upvote question'
            })
        } else {
            return res.status(200).json({
                mesage: "success"
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

//upvote answer
export async function upvoteAnswer(req, res) {
    try {
        const { answerId } = req.params
        const upvote = await answersModel.findOneAndUpdate({ answerId }, { $inc: { upvote: 1 } }, { upsert: true })
        if (!upvote) {
            return res.status(400).json({
                message: 'Failed to upvote answer'
            })
        } else {
            return res.status(200).json({
                mesage: "success"
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function downVoteAnswer(req, res) {
    try {
        const { answerId } = req.params
        const downvote = await answersModel.findOneAndUpdate({ answerId }, { $dec: { downvote: 1 } }, { upsert: true })
        if (!downvote) {
            return res.status(400).json({
                message: 'Failed to upvote question'
            })
        } else {
            return res.status(200).json({
                mesage: "success"
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}