const express = require('express');
const router = express.Router();
const { handleUserSignup, handleUpdateLocUser,handleUserLogin, handleForgotPassword, handleResetPassword, handleUserLogout, handleconfirmSignUp } = require('../controllers/user');

// Confirm sign-up
router.post('/confirm-signup/:token', handleconfirmSignUp);
router.post('/signup', handleUserSignup)


router.post('/login',handleUserLogin)
router.get('/logout',handleUserLogout)

router.patch('/longlat', handleUpdateLocUser)

router.post('/forgot-password', handleForgotPassword)
router.post('/reset-password/:token', handleResetPassword)



module.exports=router