const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  login, createUser,
} = require('../controllers/users');
const auth = require('../middlewares/auth');
const userRouter = require('./users');
const movieRouter = require('./movies');
const NotFoundError = require('../errors/404error');

router.post('/signin', celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string()
        .required()
        .min(2)
        .max(30),
      email: Joi.string()
        .required()
        .email(),
      password: Joi.string()
        .required(),
    }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object()
    .keys({
      email: Joi.string()
        .required()
        .email(),
      password: Joi.string()
        .required(),
      name: Joi.string()
        .required()
        .min(2)
        .max(30),
    }),
}), createUser);

router.use(auth);
router.use('/', userRouter);
router.use('/', movieRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Обработка неправильного пути'));
});

module.exports = router;
