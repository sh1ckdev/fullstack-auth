require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require('./routes/index')
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: 'http://localhost:5175', 
  credentials: true, 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', router)
app.use(errorMiddleware)

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порте ${PORT}`);
    });
  } catch(e) {
    console.log(e)
  }
}

start()