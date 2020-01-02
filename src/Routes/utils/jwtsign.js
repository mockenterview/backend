var jwt = require("jsonwebtoken");
module.exports = function (secret, payload){
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, {expiresIn:"2h"}, function(err, token) {
            if(err){
                reject(err)
            }else{
                resolve(token)
            }
          });        
    })
}