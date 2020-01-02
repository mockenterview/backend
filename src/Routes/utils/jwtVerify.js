var jwt = require("jsonwebtoken");
module.exports = function (token, secret , expectedKey){
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, function(err, decoded) {
          

            if(err){
                console.error(err)
                reject(`$JWT ERROR: ${err}`)
            }else{
                resolve(decoded[expectedKey])
            }
          });        
    })
}