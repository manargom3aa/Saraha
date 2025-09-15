import mongoose from "mongoose";


export const genderEnum = {male:"male",female: "female"}
export const roleEnum = {user:"user",admin: "admin"}
export const providerEnum = {system: "system", google: "google"}


const userSchema= new mongoose.Schema({

    firstName:{type:String , require:true, minLength:2, maxLength:20},
    lastName:{type:String , require:true, minLength:2, maxLength:20},
    email:{type:String , require:true, unique:true },
     password:{type:String , require:function (){
    //   console.log({ DOC: this});
    return this.provider === providerEnum.system ? true: false
   }
},
    oldPasswords: [String],
    forgotPasswordOtp: String,
    changeCredentialsTime: Date,

    
 phone:{type:String , require:function (){
    return this.provider === providerEnum.system ? true : false
   }},
   gender:{
    type:String ,
    enum:{values: Object.values(genderEnum), message:`gender only allow ${ Object.values(genderEnum)}`},
    default:genderEnum.male

   },
    provider: {type:String, enum:Object.values(providerEnum), default:providerEnum.system },
    
   role:{
        type: String,
        enum:Object.values(roleEnum),
        default: roleEnum.user
   },
 
   confirmEmail:Date,
   confirmEmailOtp:String,
   picture: {secure_url : String ,public_id : String},
   coverImages: {secure_url : String ,public_id : String},
   

   deletedAt: Date,
   deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

   restoredAt: Date,
   restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},
{timestamps:true,
    toObject:{ virtuals : true},
    toJSON:{ virtuals : true}
})

userSchema.virtual("fullName").set(function(value){
    const [firstName, lastName]=value?.split(" ") || [];
    this.set({firstName,lastName})
}).get(function () {
    return this.firstName + " " + this.lastName;
})

userSchema.virtual('messages',{
    localField: "_id",
    foreignField:"receiverId",
    ref:"Message"
})


export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)
UserModel.syncIndexes()