const nodemailer = require('../config/nodemailer');


exports.newComment = (comment) => {

    // console.log('Inside the new Comment mailer');

    //for rendering email
let htmlstring = nodemailer.renderTemplate({comment:comment} , 'comment.ejs')
  console.log('cooment '  , comment);
   nodemailer.transporter.sendMail({
       
     from : 'duperhritik@gmail.com',
     to: comment,
     subject : "New Comment Published",
     html : htmlstring   // earlier hardcoded
   } , (err , info)=>{
      
     if(err){
        console.log('Error in sending mail' , err);
     }

     console.log('Message Sent' , info);
     return;
   })
    
}