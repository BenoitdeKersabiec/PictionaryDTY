// Imports
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = 'lfvlfcvsfvdf5gd8ju6khb1q9egsmfdoijlogkjbkdhn8n91sgfd1v6f8gbOQRFFB25GBFGB6WF68gbfgndg68xcs6re8fqdq1';


// Exported functions
module.exports = {
    // generate a token for a user
    generateTokenForUser: function(userData){
        return jwt.sign({
            userId: userData._id,
            username: userData.name,
            isAdmin: userData.isAdmin
        },
        JWT_SIGN_SECRET)
    },

    // from a token, return the encrypted data
    getUserData: function(token){
        var userId = 0;
        var username = '';
        var isAdmin = false;
        if (token != null){
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null){

                    userId = jwtToken.userId;
                    username = jwtToken.username;
                    isAdmin = jwtToken.isAdmin;
                } 
            } catch(err){}
        }
        return {_id: userId, name: username, isAdmin: isAdmin};
    },

    // check if a token is valid
    verifyToken: function(token){
        return (jwt.verify(token, JWT_SIGN_SECRET));
    }
}