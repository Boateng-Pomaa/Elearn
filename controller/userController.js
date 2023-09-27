import { userModel } from '../Model/userSchema.js'
import { feedModel } from '../Model/feedSchema.js'
import { answersModel } from '../Model/answersSchema.js'
import { scoreModel } from '../Model/scoresSchema.js'
import { transporter } from '../middleware/handlebarsConfig.js'
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
        const user = await userModel.findById({ _id: id }).populate('score')
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
        const posts = await feedModel.find().populate({
            path: 'username',
            select: '-_id username'
        })
            .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (most recent first)
            .limit(50)

        const feeds = posts.map(post => {
            const createdAt = post.createdAt

            const now = new Date()
            const currentDay = now.getDate()
            const postDay = new Date(createdAt).getDate()

            let formattedTime
            if (currentDay === postDay) {
                const timestamp = new Date(createdAt)
                formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } else {
                formattedTime = new Date(createdAt).toLocaleDateString()
            }

            return {
                ...post.toObject(),
                username: post.username.username,
                createdAt: formattedTime
            }
        })

        if (posts) {
            res.status(200).json({
                message: "Success",
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

///specific question
export async function specificQuestion(req, res) {
    try {
        const { questionId } = req.params
        const feed = await feedModel.findOne({ _id: questionId }).populate({
            path: "answers"
        })
        if (feed) {
            res.status(200).json({
                feed
            })
        } else {
            return res.status(400).json({ message: "Error Loading answers" })
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
                message: "Question Posted Successfully",
                posts
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
        }).populate({
            path: 'username',
            select: '-_id username'
        })
            .sort({ createdAt: -1 })
            .limit(50)

        const feeds = feed.map(post => {
            const createdAt = post.createdAt

            const now = new Date()
            const currentDay = now.getDate()
            const postDay = new Date(createdAt).getDate()

            let formattedTime
            if (currentDay === postDay) {
                const timestamp = new Date(createdAt)
                formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } else {
                formattedTime = new Date(createdAt).toLocaleDateString()
            }

            return {
                ...post.toObject(),
                username: post.username.username,
                createdAt: formattedTime
            }
        })
        if (!feed) {
            return res.status(400).send("Unable to fetch data")
        }
        return res.status(200).json({ message: "success", feeds })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

////answering post
export async function addAnswer(req, res) {
    try {
        const { id } = req.params
        const { content } = req.body
        const { questionId } = req.query
        console.log(questionId)
        const questExist = await feedModel.findOne({ _id: questionId })
        if (!questExist) {
            return res.status(400).json({
                message: 'question not found'
            })
        }
        const newAnswer = await answersModel.create({ username: id, questionId, content })
        if (!newAnswer) {
            return res.status(400).json({
                message: 'Failed to record answer'
            })
        }
        return res.status(200).json({
            mesage: "Answer recorded!",
            newAnswer
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export async function viewAnswers(req, res) {
    try {
        const { questionId } = req.params
        const answer = await answersModel.find({ questionId }).populate({
            path: 'username',
            select: '-_id username'
        })

        const answers = answer.map(post => {
            const createdAt = post.createdAt

            const now = new Date()
            const currentDay = now.getDate()
            const postDay = new Date(createdAt).getDate()

            let formattedTime
            if (currentDay === postDay) {
                const timestamp = new Date(createdAt)
                formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } else {
                formattedTime = new Date(createdAt).toLocaleDateString()
            }

            return {
                ...post.toObject(),
                username: post.username.username,
                createdAt: formattedTime
            }
        })
        if (!answer) {
            return res.status(400).json({ message: 'no answers' })
        }
        return res.status(200).json({ answers })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}



////individual questions
export async function yourQuestion(req, res) {
    try {
        const { id } = req.params
        const allQuestions = await feedModel.find({ username: id }).sort({ createdAt: -1 })

        const feeds = allQuestions.map(post => {
            const createdAt = post.createdAt

            const now = new Date()
            const currentDay = now.getDate()
            const postDay = new Date(createdAt).getDate()

            let formattedTime
            if (currentDay === postDay) {
                const timestamp = new Date(createdAt)
                formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } else {
                formattedTime = new Date(createdAt).toLocaleDateString()
            }

            return {
                ...post.toObject(),
                username: post.username.username,
                createdAt: formattedTime
            }
        })

        if (!allQuestions) {
            return res.status(400).json({
                message: 'Failed to load questions'
            })
        } else {
            return res.status(200).json({
                mesage: "success",
                feeds
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
        const { id } = req.params
        const allAnswers = await answersModel.find({ username: id })
        const answers = allAnswers.map(post => {
            const createdAt = post.createdAt

            const now = new Date()
            const currentDay = now.getDate()
            const postDay = new Date(createdAt).getDate()

            let formattedTime
            if (currentDay === postDay) {
                const timestamp = new Date(createdAt)
                formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } else {
                formattedTime = new Date(createdAt).toLocaleDateString()
            }

            return {
                ...post.toObject(),
                username: post.username.username,
                createdAt: formattedTime
            }
        })
        if (!allAnswers) {
            return res.status(400).json({
                message: 'Failed to load answers'
            })
        } else {
            return res.status(200).json({
                mesage: "success",
                answers
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// ////saving scores
export async function saveScore(req, res) {
    try {
        const { id, score, quiz } = req.params
        console.log(id, score, quiz)
        const savedScore = await scoreModel.create({
            user_id: id,
            score,
            quiz
        })
        if (!savedScore) {
            return res.status(400).json({ message: "failed to save score" })
        }
        return res.status(200).json({ message: "Scores saved sucessfully", savedScore })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }

}

//upvote answer
export async function upvoteAnswer(req, res) {
    try {
        const { answerId } = req.params
        const answers = await answersModel.findOneAndUpdate({ _id: answerId }, { $inc: { upvote: 1 } }, { new: true })
        if (!answers) {
            return res.status(400).json({
                message: 'Failed to upvote answer'
            })
        } else {
            return res.status(200).json({
                mesage: "success",
                answers
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
        const answers = await answersModel.findOneAndUpdate({ _id: answerId }, { $inc: { upvote: -1 } }, { new: true })
        if (answers) {
            return res.status(400).json({
                message: 'Failed to upvote question'
            })
        } else {
            return res.status(200).json({
                mesage: "success",
                answers
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}



///reseting password
export async function reqPasswordReset(req, res) {
    try {
        const { email } = req.params
        var user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "User does not exist"
            })
        }

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "30mins"
        })
        const data = { Token: resetToken, Id: user._id }
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USERNAME,
            template: 'passwordResetRequest',
            subject: 'Password Reset Request',
            context: {
                link: `${process.env.BASE_URL}/verifyUser/${user._id}/${resetToken}`,
                username: user.username
            }
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(400).json(error)
            } else {
                res.json({
                    message: "success",
                    data,
                })
                console.log("Email sent: " + info.response)
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}
/////resetting password
export async function passwordVerification(req, res) {
    try {
        const { id, resetToken } = req.params
        console.log(id, resetToken)
        var user = await userModel.findOne({ _id: id })
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired Link" })
        } else {
            const hashedToken = await bcrypt.hash(resetToken, 10)
            user = await userModel.findByIdAndUpdate({ _id: id }, { token: hashedToken })

            return res.status(200).send("Email Verified go back to the app and set new password")
        }
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}


//adding new password
export async function resetPassword(req, res) {
    try {
        const { password } = req.body
        const { id, Token } = req.params
        var user = await userModel.findOne({ _id: id })
        if (user) {
            const isValid = bcrypt.compare(Token, user.token)
            if (!isValid) {
                return res.status(400).json({ message: "Invalid or expired Link" })
            }
            user.password = password
            const hashed = await bcrypt.hash(user.password, 10)
            user = await userModel.findByIdAndUpdate({ _id: id }, { password: hashed })

            const mailOptions = {
                to: user.email,
                from: process.env.EMAIL_USERNAME,
                template: 'passwordReset',
                subject: 'Password Reset Successfully',
                context: {
                    email: user.email
                }
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(400).json(error)
                } else {
                    res.json({
                        message: "Password Reset Sucessfully", data: "sent"
                    })
                    console.log("Email sent: " + info.response)
                }
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}