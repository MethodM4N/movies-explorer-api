require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');

const { PORT = 3001 } = process.env;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://127.0.0.1:27017/moviesdb');
app.use(express.json());

const options = {
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://movies.kolganov.nomorepartiesxyz.ru',
    'https://movies.kolganov.nomorepartiesxyz.ru',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

app.use('*', cors(options));

app.use(cookieParser());

app.use(requestLogger); // подключаем логгер запросов
app.use(helmet());

app.use(routes);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());

app.use(errorHandler);

app.listen(PORT);
