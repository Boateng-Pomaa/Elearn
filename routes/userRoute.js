import express from 'express'
const router = express.Router()
import { check } from 'express-validator'
import { registerUser, loginUser, profile, feed, post, search, addAnswer, yourQuestion, yourAnswer,saveScore,resetPassword } from '../controller/userController.js'
import { passwordVerification, upvoteAnswer, addDeviceToken,notification,downVoteAnswer, getScores, specificQuestion, viewAnswers ,reqPasswordReset} from '../controller/userController.js'



router.post('/signup', registerUser)
  .post('/login', [
    check("A valid password is required").isLength({ min: 4 })
  ], loginUser)
  .get('/search', search)
  .get('/feed', feed)
  .get('/profile/:id', profile)
  .post('/post/:username', post)
  .post('/answer/:id', addAnswer)
  .get('/userQuestions/:id', yourQuestion)
  .get('/userAnswers/:id', yourAnswer)
  .post('/upvote/:answerId', upvoteAnswer)
  .post('/downvote/:answerId', downVoteAnswer)
  .get('/viewQuestion', specificQuestion)
  .get('/viewAnswers/:questionId', viewAnswers)
  .post('/saveScore/:id/:score/:quiz',saveScore)
  .post('/requestpassword/:email',reqPasswordReset)
  .post('/resetPassword/:id/:Token', resetPassword)
  .get('/verifyUser/:id/:resetToken',passwordVerification)
  .get('/getScore/:id',getScores)
  .post('/update/:id/:fcm_token',addDeviceToken)
  .post('/notify/:username',notification)

export default router