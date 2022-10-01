const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { validateUrl } = require('../customvalidations/validateurl');
const { validateId } = require('../customvalidations/validateid');
const {
  getMovies, deleteMovieById, createMovie,
} = require('../controllers/movies');

router.get('/movies', getMovies);

router.post('/movies', celebrate({
  body: Joi.object()
    .keys({
      nameRU: Joi.string()
        .required(),
      nameEN: Joi.string()
        .required(),
      country: Joi.string()
        .required(),
      director: Joi.string()
        .required(),
      duration: Joi.number()
        .required(),
      year: Joi.string()
        .required(),
      description: Joi.string()
        .required(),
      image: Joi.string()
        .required()
        .custom(validateUrl),
      trailerLink: Joi.string()
        .required()
        .custom(validateUrl),
      thumbnail: Joi.string()
        .required()
        .custom(validateUrl),
      movieId: Joi.number()
        .required(),
    }),
}), createMovie);

router.delete('/movies/:_id', celebrate({
  params: Joi.object()
    .keys({
      _id: Joi.string()
        .required()
        .custom(validateId),
    }),
}), deleteMovieById);

module.exports = router;
