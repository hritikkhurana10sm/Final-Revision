'using strict';

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({

    destination : (req ,file , cb) => {
        cb(null , 'uploads');
    },
    filename : (req , file , cb) => {
                                              // remove forward slashes
        cb(null , file.fieldname + "-" + Date.now()+".jpg");
    }
});

// specific file like jpqg , png we want to store
const fileFilter = (req , file , cb) => {

    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ){
        cb(null , true);
    }else{
        cb(null , false);
    }
}

const upload = multer({storage : storage , fileFilter : fileFilter});

module.exports = upload;