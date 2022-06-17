const express = require('express');
const port = process.env.PORT || 4000;
const app = express();
const path = require('path');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bodyparser = require('body-parser');
const User = require('./models/user'); 
const session = require('express-session')
const mongoose = require('mongoose');
const config = require('./config');
const middleware = require('./middleware/index');
const ejs = require('ejs');

const mailer = require('./mailers/comment');

const upload = require('./multer');

const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// passportJWT 
const jwt = require('jsonwebtoken');
const passportJWT = require('./config/passport-jwt-strategy');

//flash
app.use(cookieParser("This is my secret!"));
app.use(flash());

// setting the view engine
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , "views"));
app.use('/uploads' , express.static(path.join(__dirname , 'uploads')));


// to get the data in the request
app.use(bodyparser.urlencoded({
    extended:true
}))

//we need express session before we use passport session
app.use(
    session({
        secret: "Hello, This is secret line",
        resave: false,
        saveUninitialized: false,
     
      cookie: {
        maxAge: 3600000,
        secure: false,
        httpOnly: true
      }      
    })
);

//passport setup
app.use(passport.initialize());
// passport will need a session for how much time user needs to be login
// for that we use express session
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// mongodb setup
mongoose
  .connect(config.dbUrl, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("DataBase Connected Successfully");
  })
  .catch(err => console.log(err));



// routes and controllers

app.get('/' , function(req , res){
    res.render('index');
})

app.get('/home' ,middleware.isLoggedIn ,  function(req , res){
    res.render('home' , {
         success : req.flash('success'),
         error  : req.flash('error')
    });
});

app.post('/uploadpic' , upload.single('file') , function(req , res){
       
                req.user.file = req.file.filename;
                req.user.save();
               res.render('home' , {
                success : req.flash('success'),
                error  : req.flash('error')
      
         });
});

//get sign in page
app.get('/signin' , function(req , res){
    res.render('signin');
})

app.post('/signin' , function(req , res , next){
     
      // mailer.newComment("hritikkhurana10sm@gmail.com");
     passport.authenticate("local" , (err , user , info)=>{
        if(err){
            return res.redirect('/signin');
        }
        if(!user){
            return res.redirect('/signin');
        }

        req.login(user , err=>{
             
             if(err){
                return res.redirect('/signin');
             }
             req.flash('success' , 'Successfully Signed In');
             return res.redirect('/home');
        });
     })(req , res , next);
});

// get sign up page
app.get('/signup' , function(req , res){
    res.render('signup');
})

// sign up data upload
app.post('/signup' , function(req , res){
   console.log('req data ' , req.body);
    const user = new User({
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
     })

     User.register(user , req.body.password , function(err , user){

           if(err){
             console.log('Error while creating user' , err);
             res.json({
                success : false,
                message : "Your account can not be made"
             });
           }else{
              
              console.log('Users details are as follows : ' , user);
              req.flash('success' , 'Successfully Signed Up');
              res.render('signin');
           }
     });
});

app.get('/showusers' ,middleware.isLoggedIn ,async function(req , res){

     const users = await User.find({});
     console.log('users ', users);
     res.render('showusers' , {
      users : users
     })
}); 

// sign out
app.get('/signout' , function(req , res){
    
  req.logout(function(err) {
    if (err) { return next(err); }
    // did not work
    res.clearCookie('connect.sid', { path: '/' });
    res.redirect('/');
  });
})


// updating the details
app.post('/update' , middleware.isLoggedIn, function(req , res){
 
     req.user.username = req.body.username || req.user.username;
     req.user.email = req.body.email || req.user.email;
     req.user.file = req.file.fieldname || req.user.file;
     
     req.user.save((err , user)=> console.log('error in saving the changing ' , err));

     res.render('showusers');
     });


app.get('/forget' , middleware.isLoggedIn,function(req , res){
  return res.render('forget');
})     
 // forward password and reset password
app.post('/resetpassword' , async function(req , res){
    
     if(req.body.password != req.body.confirm_password){
      return res.json({
          message : "Password not equal to confirm password"
      });
     }else{
        
          const user = await User.findOne({username : req.user.username});
          await user.setPassword(req.body.password);

          req.user.password = req.body.password || req.user.password;
          await req.user.save();

          const updatedUser = await user.save();

          res.json({
            message : "Successfully Changed passwor"
          })
          
     }
     
}) 

 
 // delete the user or delete user
app.get('/deleteUser' , middleware.isLoggedIn , function(req , res){
     res.render('deleteUser' , {
      user : req.user
     });
})

app.get('/deleteUser/:id' , function(req , res ,next){
       
      let id = req.params.id;

      const user = User.findByIdAndDelete(id , (err , user)=>{
           if(err){
            console.log('Error in deleting the user' , err);
           }

           console.log('user is successfully deleted');
          
      })

      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

// ------------------------------------------------------------

// api's
app.get('/api/v1' , async function(req , res){
   
        const users = await User.find({});
      
        res.status(200).json({
           message : "A list of users",
           users : users 
        });
})

// to create authentication and authorization of api,  we will use passport-jwt 
// we should verify password

// first created the session , so as to verify the user and providing the token to start request and response cycle
app.post('/createSession' , async function(req ,res){
 
    let user = await User.findOne({username : req.body.username});

    if(!user || user.password != req.body.password){
        res.status(422).json({
          message : "Password is incorrect"
        })
    }else{
      return res.status(200).json({

        message : "Sing in successfully",
        data : {
          // encypted
          token : jwt.sign(user.toJSON() , 'novel' ,{
               expiresIn : '100000'
          } )
        }
      })
          
    }
});

// delete the user through api
app.get('/api/v1/:id' ,passport.authenticate('jwt' , {session : false}) , function(req , res){
       
   let id = req.params.id;
   const user = User.findByIdAndDelete(id , (err , user)=>{

    if(err){
      console.log('Error while deleting the user' , err);
    }else{
       
         res.status(200).json({
          message : `A user is deleted successfully ${user}`
         })
    }
   })
});
// -------------------------------------------------------------

app.listen(port , function(err){

    if(err){
        console.log('Error in running the server' , err);
    }
    console.log('Server is listening on port ' , port);
})