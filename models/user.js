var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({

    email : {type : String , required : true , unique : true},
    username : {type : String , unique: true, required:true},
    password : {type:String , required: true},
    file : {type : String , default : "file-1655418263289.jpg" , required : true}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User" , UserSchema);