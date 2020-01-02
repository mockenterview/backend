var jwtVerify = require("./utils/jwtVerify.js");

module.exports = {
    loginCheck(secret){
        return async (request, response, next) => {
            try{
                let email = await jwtVerify(request.headers.authorization, secret, "email");
                request.email = email;
                next();
            }catch(err){
                response.status(500).json({message:err});
            }
            
        }
    }
    
}