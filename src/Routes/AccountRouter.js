var accountRouter = require("express").Router();
var AccountModel = require("../Models/Account.js");
var parseMongooseError = require("./utils/parseMongooseError.js");

accountRouter.route("/register")
    .post(async ({body:{email, password}}, response) => {
       
        if(!email || !password){
            response.status(400).json({message:"Bad request body needs to contain email/password"});
        }else{
            let account = {email, password};
            try{
                
                await AccountModel.create(account);
                
                response.status(201).json({message:"Account created"});
            }catch(err){
                response.status(500).json({message:parseMongooseError(err)});
            }
        }
    })
module.exports = accountRouter;