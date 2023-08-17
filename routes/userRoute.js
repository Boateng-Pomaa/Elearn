import express from 'express'
const router = express.Router()
import { check } from 'express-validator'
import {registerUser, loginUser, profile ,feed, post,search,answers,yourQuestion,yourAnswer} from '../controller/userController.js'




router.post('/signup', registerUser)
router.post('/login', [
    check("A valid password is required").isLength({min:4})
      ],loginUser)

      .get('/profile/:id',profile)
      .get('/feed',feed)
      .post('/post/:username',post)
      .get('/search',search)
      .post('/answer/:id/:quesionId',answers)
      .get('/userQuestions/:id',yourQuestion)
      .get('/userAnswers/:id',yourAnswer)

export default router