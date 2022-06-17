const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { model } = require('mongoose');
let transporter = nodemailer.createTransport({
    service : 'gmail',
    host : 'smtp.gmail.com',
    port : 587,
    secure : false,
    auth : {
        user : 'duperhritik@gmail.com',
        pass : 'iyenozwtonxqeahw'
    }
});


let renderTemplate = (data , relativePath) =>{
 
       let mailHTML;

       ejs.renderFile(
            path.join(__dirname , '../views/mailers' ,relativePath),
            data,
            function(err , template){
                if(err){
                    console.log('Error in rendering template' , err);
                }else{

                    mailHTML = template;
                }
            }        
       )
       return mailHTML;
}

module.exports = {
    transporter : transporter,
    renderTemplate : renderTemplate
}