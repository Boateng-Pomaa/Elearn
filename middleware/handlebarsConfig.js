import  nodemailer from "nodemailer"
import hbs from "nodemailer-express-handlebars"
import dotenv from 'dotenv'
import path from "path"





dotenv.config()

export const transporter = nodemailer.createTransport({
  host: 'smpt.gmail.com',
  service: 'gmail',
  port: 465,
  secure: true,
  logger: true,
  debugger: true,
  secureConnection: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})


export const handlebarsOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve("../templates"),
      defaultLayout: false,
    },
    viewPath: path.resolve("templates"),
    extName: ".handlebars",
  }
  
  transporter.use('compile', hbs(handlebarsOptions))

