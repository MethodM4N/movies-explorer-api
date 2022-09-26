const Movie = require('../models/movie');

const BadRequestError = require('../errors/400error');
const NotFoundError = require('../errors/404error');
const ForbiddenError = require('../errors/403error');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => res.status(200).send({ data: movie }))
    .catch((err) => next(err));
};

const createMovie = (req, res, next) => {
  const {
    nameRU, nameEN, country, director, duration, year,
    description, image, trailerLink, thumbnail, movieId,
  } = req.body;
  Movie.create({
    nameRU,
    nameEN,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные в метод создания кинокартины'));
      } else {
        next(err);
      }
    });
};

const deleteMovieById = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(() => {
      next(new NotFoundError('Кинокартина не найдена или был запрошен несуществующий роут'));
    })
    .then((movie) => {
      if (movie.owner.toString() === req.user._id) {
        Movie.deleteOne({ _id: movie._id })
          .then(res.status(200).send({ message: 'Кинокартина удалена' }))
          .catch((err) => next(err));
      } else {
        next(new ForbiddenError('Отсутствуют права доступа на удаление чужой кинокартины'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные в метод удаления кинокартины'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies, createMovie, deleteMovieById,
};
