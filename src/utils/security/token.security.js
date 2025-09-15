 
import jwt from 'jsonwebtoken'
import * as DBService from '../../DB/db.service.js'
import { v4 as uuidv4 } from "uuid";
import { roleEnum, UserModel } from '../../DB/models/User.model.js'
import { TokenModel } from '../../DB/models/Token.model.js'
export const signatureLevelEnum = { bearer: "Bearer" , system:  "System"}
export const tokenTypeEnum = { access:"access", refresh:"refresh"}
export const logoutEnum = {signoutFromAll:"signoutFromAll", signout: "signout", stayLoggedIn: "stayLoggedIn"}



export const generateToken = async ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE,
    options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) }

} = {} ) => {
    return jwt.sign(payload,secret,options)
}

export const verifyToken = async ({
  token = "",
  secret
} = {} ) => {
  return jwt.verify(token, secret)
}




export const getSignatures = async({signatureLevel = signatureLevelEnum.bearer } ={}) => {
  let signatures = { accessSignature: undefined, refreshSignature: undefined}
switch (signatureLevel) {
  case signatureLevelEnum.system:
    signatures.accessSignature = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE;
    signatures.refreshSignature = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE;
    break;

  default:
        signatures.accessSignature = process.env.ACCESS_USER_TOKEN_SIGNATURE;
    signatures.refreshSignature = process.env.REFRESH_USER_TOKEN_SIGNATURE;
    break;
}
return signatures
}

export const decodedToken = async({ next, authorization = "" , tokenType=tokenTypeEnum.access}={})=>{
                   
           const [bearer , token ] = authorization?.split(' ')|| []
          //  console.log({ bearer, token });
           
          if (!bearer || !token) {
              return next(new Error('missing token parts', { cause: 401 }))
            }

          const signatures = await getSignatures({ signatureLevel: bearer })
const decoded = await verifyToken({
  token,
  secret: tokenType === tokenTypeEnum.access ? signatures.accessSignature : signatures.refreshSignature
})
          // console.log({decoded});
          
          if (decoded.jti && await DBService.findOne({ model:TokenModel,filter: { jti: decoded.jti }})) {
            return next(new Error("In-valid login credentials", {cause:401}))
          }

          const user = await DBService.findById({ model: UserModel,id: decoded._id })

          if (!user) {
               return next(new Error("not register account", {cause:404}))

          }
          //  console.log({user:user.changeCredentialsTime?.getTime(), decoded:decoded.iat*1000});
       if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
  return next(new Error("In-valid login credentials", {cause:401}))
}

          return { user, decoded }
         
     
   
}


export const generateLoginCredentials = async ({ user } = {}) =>{
    const signatures = await getSignatures({
        signatureLevel: user.role != roleEnum.user ? signatureLevelEnum.system: signatureLevelEnum.bearer
    })
    // console.log(signatures);
      const jwtid = uuidv4();
  const access_token = await generateToken({
  payload: { _id: user._id },
  secret: signatures.accessSignature,
  options: {
    jwtid,
   expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
  },
});

const refresh_token = await generateToken({
  payload: { _id: user._id },
  secret: signatures.refreshSignature,
  options: {
    jwtid,
    expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN)

  },
});

  const decodedAccess = jwt.decode(access_token);
  // console.log("Access token exp:", new Date(decodedAccess.exp * 1000));

  const decodedRefresh = jwt.decode(refresh_token);
  // console.log("Refresh token exp:", new Date(decodedRefresh.exp * 1000));


    return { access_token, refresh_token }    
}


export const createRevokeToken = async ({ req } = {}) => {
      await DBService.create({
      model: TokenModel,
      data:{
          jti:req.decoded.jti,
          expiresIn: Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRES_IN) * 1000),

          userId: req.decoded._id
      }
    })
    return true
  }