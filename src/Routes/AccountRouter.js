var accountRouter = require("express").Router();
var AccountModel = require("../Models/Account.js");
var bcrypt = require("bcrypt");
var jwtSign = require("./utils/jwtsign.js");
var parseMongooseError = require("./utils/parseMongooseError.js");
var bodyCheck = require("./utils/bodycheck.js");
if(process.env.NODE_ENV != "development"){
    var env = require("dotenv")
    var {secretKey} = env.config().parsed;
}


accountRouter.route("/register")
    .post(async (request, response) => {
        
        let body = await bodyCheck(Object.keys(request.body), ["email", "password", "firstName", "lastName"]);
        
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
    });
accountRouter.route("/login")
    .post(async (request, response) => {
        let body = await bodyCheck(Object.keys(request.body), ["email", "password"]);

        if(body.valid){
            
            let login = {email, password}= request.body;
            //hash compare
            try{
                let account = await AccountModel.findOne({email:login.email})
                let passwordValid = await bcrypt.compare(login.password, account.password)
                if(passwordValid){
                    //create token 
                   let token = await jwtSign(secretKey, {email:account.email});
                   response.status(200).json({message:"logged in", token});
                }else{
                    response.status(401).json({message:"Invalid email/password"});
                }
            }catch(err){
                response.status(500).json({message:parseMongooseError(err)});
            }
        }else{
            response.status(400).json({message:body.message});
        }
    })
module.exports = accountRouter;