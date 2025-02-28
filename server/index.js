require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { logReqRes } = require('./middlewares');
const { restrictTo, checkForAuthentication } = require('./middlewares/auth');
const { connectMongoDB } = require('./connect');

const userRoute = require('./routes/user');
const customerRoute = require('./routes/customer');
const adminRoute = require('./routes/admin');
const geoRoute = require('./routes/geoRoutes');
const statRoute = require('./routes/stats');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
    console.error("MONGODB_URI is not defined in the .env file");
    process.exit(1);
}

app.use(cookieParser());
app.use(cors({
    origin: 'https://ayus-killz-front.onrender.com', // React frontend origin
    credentials: true, // Allow cookies
}));

// Connect to MongoDB using URI from .env file
connectMongoDB(mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });
    

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logReqRes("log.txt"));
app.use(checkForAuthentication);
app.use(express.static('public'));

// Views
app.set('view engine', 'ejs');

// Default route for testing
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Routes
app.use('/user', userRoute);
app.use('/customer', restrictTo(['CUSTOMER']), customerRoute);
app.use('/admin', restrictTo(['ADMIN', 'CUSTOMER']), adminRoute);
app.use('/add-geo', restrictTo(['ADMIN']), geoRoute);
app.use('/stats', restrictTo(['ADMIN']), statRoute);


server.listen(port, () => console.log("Server running on port", port));
