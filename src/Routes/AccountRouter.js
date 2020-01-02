var accountRouter = require("express").Router();
var AccountModel = require("../Models/Account.js");
var parseMongooseError = require("./utils/parseMongooseError.js");
var bodyCheck = require("./utils/bodycheck.js");

accountRouter.route("/register")
    .post(async (request, response) => {
        
        let body = bodyCheck(Object.keys(request.body), ["email", "password", "firstName", "lastName"]);
        
        if(body.valid){
            let account = {email, password, firstName, lastName} = request.body
        
            try{       
                await AccountModel.create(account);
                response.status(201).json({message:"Account created"});
            }catch(err){
                response.status(500).json({message:parseMongooseError(err)});
            }
        }else{
            response.status(400).json({message:body.message});
        }
    })
module.exports = accountRouter;