require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
// const redis = require('redis');


const {logReqRes}=require('./middlewares')
const {restrictTo,checkForAuthentication}=require('./middlewares/auth')
const cookieParser=require('cookie-parser')

const {connectMongoDB}=require('./connect')

// const staticRouter=require('./routes/staticRouter')
const userRoute=require('./routes/user')
const customerRoute=require('./routes/customer')
const adminRoute=require('./routes/admin')
const geoRoute=require('./routes/geoRoutes')
const statRoute=require('./routes/stats')

const app = express();
const server = http.createServer(app);
const port = process.env.PORT||4000;

app.use(cookieParser())

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000', // React frontend origin
    credentials: true, // Allow cookies
}));


// Added proper error handling for MongoDB connection
connectMongoDB('mongodb://127.0.0.1:27017/omtraders')
.then(()=>console.log('MongoDB Connected'))
.catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

//middelwares
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(logReqRes("log.txt"))
app.use(checkForAuthentication)
app.use(express.static('public'));

//views
app.set('view engine', 'ejs');

app.use('/user', userRoute)
app.use('/customer',restrictTo(['CUSTOMER']),customerRoute)
app.use('/admin',restrictTo(['ADMIN','CUSTOMER']),adminRoute)
app.use('/add-geo', restrictTo(['ADMIN']),geoRoute);
app.use('/stats',restrictTo(['ADMIN']),statRoute)
server.listen(port, () => console.log("Server running on port", port));