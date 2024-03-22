const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require('body-parser');
const config = require('./config/config');

const bcrypt = require('bcryptjs');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const blogRoutes = require('./routes/blogRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const sliderRoutes = require('./routes/sliderRoutes');
const galleryRoutes = require('./routes/galleryRoutes');


dotenv.config();

const corsOptions = {
  //origin: 'https://aduvie-blush.vercel.app', 
  origin: 'http://localhost:5173', 
  credentials: true,
};


app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/uploads/slider', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));


mongoose
  .connect(config.mongoURI, {
    w: 1
  })
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log('MongoDb Error: ', err);
  });

app.use('/api/v1/auth/admin', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/sliders', sliderRoutes);
app.use('/api/v1/galleries', galleryRoutes);


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Backend server running at port: ${port}`);
});