require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../errors/400error');
const NotFoundError = require('../errors/404error');
const UnauthorizedError = require('../errors/401error');
const ConflictError = require('../errors/409error');

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then(() => res.status(201).send({
      name, email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные в метод создания пользователя'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким e-mail уже существует'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Передан неверный логин или пароль');
      }
      return bcrypt.compare(password, user.password)

        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Передан неверный логин или пароль');
          }
          const { NODE_ENV, JWT_SECRET } = process.env;
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'secret-af-key',
            { expiresIn: '7d' },
          );
          return res
            .cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
              secure: true,
              sameSite: 'none',
            })
            .send({ message: 'Вход совершен успешно' });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => {
      next(new NotFoundError('Пользователь не найден или был запрошен несуществующий роут'));
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким e-mail уже существует'));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные в метод обновления информации о пользователе'));
      }
      return next(err);
    });
};

const getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => (new NotFoundError('Пользователь не найден или был запрошен несуществующий роут')))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => next(err));
};

const logout = (req, res, next) => {
  const token = req.cookies.jwt;
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(1),
  })
    .catch((err) => {
      if (!token) {
        next(new UnauthorizedError('Необходима авторизация'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  createUser, updateUserInfo, login, getUserInfo, logout,
};
