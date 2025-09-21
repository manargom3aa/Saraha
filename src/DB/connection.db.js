import mongoose from 'mongoose'

const connectDB = async () => {
    await mongoose.connect(process.env.ATLAS_URI)
    .then(() => {
      console.log('DB connected successfully 👌☘️')
    })
    .catch ((err) => {
    console.log('Fail to connect on DB ❌', err)
      
    })
}

export default connectDB
