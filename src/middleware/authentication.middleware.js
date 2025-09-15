import { asyncHandler } from "../utils/response.js";
import { decodedToken,  tokenTypeEnum } from "../utils/security/token.security.js";


export const authentication = ({tokenType = tokenTypeEnum.access} = {})  =>{
  return asyncHandler(
    async (req , res , next)=>{
      const {user , decoded}  = await decodedToken({ next, authorization: req.headers.authorization, tokenType}) || {}
      req.user = user;
      req.decoded = decoded;
      return next()
    }
  )
}


export const authorization = ({ accessRole = [] } = {}) => {
  return asyncHandler(
    async (req, res, next) => {
      // console.log({ accessRole, currentRole: req.user.role, math: accessRole.includes(req.user.role) });
      if (!accessRole.includes(req.user.role)) {
        return next(new Error("Not authorized account", { cause: 403 }))
      }
      return next();
    }
  );
};


export const auth  = ({ tokenType = [], accessRoles = [] } = {})  =>{
  return asyncHandler(async (req , res , next)=>{
    const {user , decoded}  = await decodedToken({
      next, 
      authorization: req.headers.authorization, 
      tokenType
    }) || {};

    req.user = user;
    req.decoded = decoded;

    // console.log({
    //   accessRoles,
    //   currentRole: req.user.role,
    //   match: accessRoles.includes(req.user.role)
    // });

    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Not authorized account",{ cause:403 }));
    }
    return next();
  })
}