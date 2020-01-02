var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
var env = require("dotenv")
var {ATLAS:dbURI} = env.config().parsed;

const SALT_ROUNDS = 10;
var AccountSchema =  new Schema({
    email:{
        type:String, 
        lowercase:true,
        required:true, 
        unique:true,
        validate:{
            validator(value){
                return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(value)
            },
            message:"Invalid email address"
        }
    },
    password:{
        type:String,
        required:true,
        validate:{
            validator(value){
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm.test(value);
            },
            message:"Password must be at least 8 characters long, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number Can contain special characters"           
        },
    },
})

AccountSchema.pre("save", function(next){
    if(this.isModified("password")){
        this.validate(async (error) => {
            if(!error){
                this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
                next();
            }
        })
    }else{
        next();
    }
})
var connection = mongoose.createConnection(dbURI, {useUnifiedTopology:true, useNewUrlParser:true, useCreateIndex:true});
var AccountModel = connection.model("Account", AccountSchema);
module.exports = AccountModel;