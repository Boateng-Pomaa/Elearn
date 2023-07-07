import express from 'express'
const router = express.Router()
import { check } from 'express-validator'
import {registerUser, loginUser, profile ,feed, post} from '../controller/userController.js'




router.post('/signup', registerUser)
router.post('/login', [
    check("A valid password is required").isLength({min:4})
      ],loginUser)

      .get('/profile',profile)
      .get('/feed',feed)
      .post('/post',post)

export default router