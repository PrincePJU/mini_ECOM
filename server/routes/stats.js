const express = require('express');
const router = express.Router();

const {handleGetMonthlyStats}=require('../controllers/stats')

router.get('/monthly',handleGetMonthlyStats)

module.exports=router;