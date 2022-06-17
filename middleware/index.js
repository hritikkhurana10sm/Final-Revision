
var middlewareObj = {

    // middleware to check login 
    isLoggedIn : function(req , res , next){
      
         if(req.isAuthenticated()){
            return next();
         }

         res.redirect('/');
    }
    
};

module.exports = middlewareObj;