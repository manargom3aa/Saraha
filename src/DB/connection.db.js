import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const uri = 'mongodb://localhost:27017/Sarah_App'
    const result = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000
    })

    console.log(result.models)
    console.log('DB connected successfully 👌☘️')
  } catch (error) {
    console.log('Fail to connect on DB ❌', error)
  }
}

export default connectDB
