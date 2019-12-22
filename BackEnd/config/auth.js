module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        console.log('333')
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/users/login');
    }
}