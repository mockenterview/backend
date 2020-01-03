var accountRouter = require("express").Router();
var AccountModel = require("../Models/Account.js");
var bcrypt = require("bcrypt");
var jwtSign = require("./utils/jwtsign.js");
var { loginCheck } = require("./middleware.js");
var parseMongooseError = require("./utils/parseMongooseError.js");
var bodyCheck = require("./utils/bodycheck.js");
var nodemailer = require("nodemailer");

if (process.env.NODE_ENV != "production") {
    var env = require("dotenv")
    var { secretKey,  gmail,  gmailPass } = env.config().parsed;
}else{
    var secretKey = process.env.secretKey;
    var gmail = process.env.gmail;
    var gmailPass = process.env.gmailPass;
}



var transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:gmail,
        pass:gmailPass,
    }
})

transporter.verify((error) => {
    if(error){
        console.error(error);
    }else{
        console.log("Server is ready to mail")
    }
})

accountRouter.route("/register")
    .post(async (request, response) => {

        let body = await bodyCheck(Object.keys(request.body), ["email", "password", "firstName", "lastName", "interviewer"]);

        if (body.valid) {
            let account = { email, password, firstName, lastName, interviewer } = request.body

            try {
                await AccountModel.create(account);
                response.status(201).json({ message: "Account created" });
            } catch (err) {
                response.status(500).json({ message: parseMongooseError(err) });
            }
        } else {
            response.status(400).json({ message: body.message });
        }
    });
accountRouter.route("/login")
    .post(async (request, response) => {
        let body = await bodyCheck(Object.keys(request.body), ["email", "password"]);

        if (body.valid) {

            let login = { email, password } = request.body;
            //hash compare
            try {
                let account = await AccountModel.findOne({ email: login.email })
                if (account != undefined) {
                    let passwordValid = await bcrypt.compare(login.password, account.password)
                    if (passwordValid) {
                        //create token 
                        let token = await jwtSign(secretKey, { email: account.email });
                        response.status(200).json({ message: "logged in", token });
                    } else {
                        response.status(401).json({ message: "Invalid email/password" });
                    }
                } else {
                    response.status(401).json({ message: "Invalid email/password" });
                }


            } catch (err) {
                response.status(500).json({ message: parseMongooseError(err) });
            }
        } else {
            response.status(400).json({ message: body.message });
        }
    })

accountRouter.route("/update/:field")
    .all(loginCheck(secretKey))
    .put(async (request, response) => {
        //if it can be updated
        var email = request.email;
        var field = request.params.field
        let bodyArray = Object.keys(request.body);
        try {
            if (request.app.locals.updateableFields.includes(field)) {
                switch (field) {
                    case "password":
                        {
                            let body = await bodyCheck(bodyArray, ["newPassword", "oldPassword"])
                            if (body.valid) {
                                let {oldPassword, newPassword} = request.body;
                                if(oldPassword == newPassword){
                                    throw {code:400, message:"Passwords are the same"};
                                }
                                //hashCompare oldPass with current pass
                                let account = await AccountModel.findOne({email});
                                if(account != undefined){
                                    let passwordValid = await bcrypt.compare(oldPassword, account.password);
                                    if(passwordValid){
                                        let updated = await AccountModel.updateOne(account, {password:newPassword});
                                        if(updated.nModified){
                                            //FINAL
                                            response.status(201).json({message:"Password has been successfully updated"});
                                        }else{
                                            throw {code:500, message:"Could not update password"};
                                        }
                                    }else{
                                        throw {code:400, message:"Old password is invalid"};
                                    }
                                }else{
                                    throw {code:400, message:"please sign in."};
                                }
                            }else{
                                throw body.message;
                            }
                        }
                        break;
                        //everything that does not require more then one body memeber
                    default:
                        {
                            let body = await bodyCheck(bodyArray, [field]);
                            if(body.valid){
                                let param = request.body[field]
                                let account = await AccountModel.findOne({email});
                                if(account != undefined){
                                    
                                    let updated;
                                    if(field == "workHistory" || field == "references" || field == "availableDates"){
                                      
                                        updated = await AccountModel.updateOne(account, {"$push": {[field]:{...param}}});
                                    }else if(field == "skills"){
                                        updated = await AccountModel.updateOne(account, {"$push": {[field]:param}} )
                                    } else{
                                        updated = await AccountModel.updateOne(account, {[field]:param});
                                    }
                                    if(updated.nModified){
                                        //FINAL
                                        
                                        response.status(201).json({message:`${field} has been successfully updated`});
                                    }else{
                                        throw {code:500, message:`Could not update ${param}`};
                                    }
                                }else{
                                    throw {code:400, message:"please sign in."};
                                }
                            }else{
                                throw body.message;
                            }
                        }
                        break;
                }
            } else {
                response.status(404).json({ message: `cannot update field ${request.params.field}` })
            }
        } catch (error) {
            response.status(error.code || 500).json({ message: error.message || error});
        }
    })
accountRouter.route("/user/search/:skill")
    .get(async(request, response) => {
       let query = request.params.skill
       let result = await AccountModel.find({interviewer:true, skills:query}).select("firstName bio availableDates");
       response.status(200).json({message:result});
    })
accountRouter.route("/request/:dateID")
.all(loginCheck(secretKey))
    .post(async(request, response) => {
        let _id = request.params.dateID
        let bodyArray = Object.keys(request.body);      
        try{
            let body = await bodyCheck(bodyArray, ["message"])
            if(body.valid){
                let {email:accountToEmail} = await AccountModel.findOne({availableDates:{"$elemMatch":{_id:_id}}}).select("email")
                let thisEmail = request.email;
                var message = 
                {
                    from:thisEmail,
                    to:accountToEmail,
                    subject:`new message from ${thisEmail}`,
                    text:request.body.message

                }
                await transporter.sendMail(message);
                response.status(200).json({message:"Your message has been sent"});
            }else{
                throw body.message;
            }
            
        }catch(error){
            response.status(500).json({ message:error});
        }
        

        
    })
module.exports = accountRouter;