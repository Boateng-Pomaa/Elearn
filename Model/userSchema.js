import mongoose from "mongoose"
import bcrypt from "bcrypt"


const {Schema,model} = mongoose

const userSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    email:{
      type: String,
      required:true
    },
    password:{
        type: String,
        required: true,
        minLength:6,
        maxLength:50,
       
    },
    scores:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'scores',
      default:0
    },
    token:{
      type: String
    }

},
{
    timestamps: true
}
)

userSchema.pre("save", function (next) {
    const user = this
  
    if (this.isModified("password") || this.isNew) {
      bcrypt.genSalt(10, function (saltError, salt) {
        if (saltError) {
          return next(saltError)
        } else {
          bcrypt.hash(user.password, salt, function(hashError, hash) {
            if (hashError) {
              return next(hashError)
            }
  
            user.password = hash
            next()
          })
        }
      })
    } else {
      return next()
    }
  })

export const userModel = model('users',userSchema)
