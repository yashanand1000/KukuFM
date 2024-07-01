const User = require('../models/user');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username, emailVerified: false });
        const registeredUser = await User.register(user, password);
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        registeredUser.verificationToken = verificationToken;
        await registeredUser.save();

        // Send verification email
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
        const msg = {
            to: email,
            from: 'yashanand1000@gmail.com', // Replace with your verified sender email
            subject: 'VibePocket v2 - Email Verification',
            html: `<h1>Welcome to VibePocket!</h1>
                   <p>Dear ${username},</p>
                   <p>Please verify your email address by clicking the link below:</p>
                   <a href="${verificationUrl}">Verify Email</a>
                   <p>Best regards,<br>Yash Anand - VibePocket Admin,<br>The VibePocket Team.</p>`
        };
        await sgMail.send(msg);

        req.flash('success', 'A verification email has been sent to your email address.');
        res.redirect('/login');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        console.log('Token from URL:', token); // Debug log
        const user = await User.findOne({ verificationToken: token });
        console.log('User Found:', user); // Debug log

        if (!user) {
            req.flash('error', 'Invalid verification token.');
            return res.redirect('/login');
        }

        user.emailVerified = true;
        user.verificationToken = null;
        await user.save();

        req.login(user, err => {
            if (err) {
                req.flash('error', 'An error occurred while logging in.');
                return res.redirect('/login');
            }
            req.flash('success', 'Your email has been verified. You are now logged in.');
            res.redirect('/audiobooks');
        });
    } catch (e) {
        console.error(e);  // Log the error for debugging
        req.flash('error', 'An error occurred while verifying your email.');
        res.redirect('/login');
    }
};


module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/audiobooks';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = function(req, res, next) {
    req.logout(function(err) {
        if(err){
            return next(err);
        }
        req.flash('success', "Goodbye!");
        res.redirect('/audiobooks')
    })
}