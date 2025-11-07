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
  origin: function(origin, callback) {
    const allowed = (process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:5173','http://localhost:5174','http://localhost:5175']);
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowed.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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