import { EventEmitter } from 'node:events'
import { sendEmail } from '../email/send.email.js'
import { verifyEmail } from '../email/template/verify.template.email.js'

 
export const emailEvent = new EventEmitter()

emailEvent.on("confirmEmail", async(data) =>{
    await sendEmail({ 
        to: data.to, subject:data.subject || "Confirm-Email", html: verifyEmail({otp:data.otp}) 
    }).catch(error =>{
        // console.log(`Fail to send email to ${data.to}`);
       
    }

    )
})

emailEvent.on("sendForgotPassword", async(data) =>{
    await sendEmail({ 
        to: data.to, subject:data.subject || "ForgotPassword", html: verifyEmail({otp:data.otp, title: data.title}) 
    }).catch(error =>{
        // console.log(`Fail to send email to ${data.to}`);
       
    }

    )
})