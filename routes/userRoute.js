import express from 'express'
const router = express.Router()
import { check } from 'express-validator'
import { registerUser, loginUser, profile, feed, post, search, addAnswer, yourQuestion, yourAnswer } from '../controller/userController.js'
import {upvoteQuestion,downVoteQuestion,upvoteAnswer,downVoteAnswer,specificQuestion, viewAnswers} from '../controller/userController.js'



router.post('/signup', registerUser)
router.post('/login', [
  check("A valid password is required").isLength({ min: 4 })
], loginUser)
  .get('/search', search)
  .get('/feed', feed)
  .get('/profile/:id', profile)
  .post('/post/:username', post)
  .post('/answer/:id', addAnswer)
  .get('/userQuestions/:id', yourQuestion)
  .get('/userAnswers/:id', yourAnswer)
  .post('/upvoteQ/:questionId',upvoteQuestion)
  .post('/downvoteQ/:questionId',downVoteQuestion)
  .post('/upvoteA/:answerId',upvoteAnswer)
  .post('/downvoteA/:answerId',downVoteAnswer)
  .get('/viewQuestion',specificQuestion)
  .get('/viewAnswers/:questionId',viewAnswers)

export default router