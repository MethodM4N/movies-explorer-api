const mongoose = require('mongoose');
const validateLink = require('validator/lib/isURL');

const movieSchema = new mongoose.Schema({
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: (url) => validateLink(url),
    },
  },
  trailerLink: {
    type: String,
    required: true,
    validate: {
      validator: (url) => validateLink(url),
    },
  },
  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator: (url) => validateLink(url),
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('movie', movieSchema);
