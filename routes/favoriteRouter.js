const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route('/')
  .get(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(
        favorites => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        },
        err => next(err),
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorites => {
          if (favorites != null) {
            favorites = req.body.filter(favorite => favorites.dishes.indexOf(favorite._id) === -1);
            favorites.save().then(
              favorites => {
                console.log('Favorite Created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
              },
              err => next(err),
            );
          } else {
            Favorites.create({ user: req.user._id, dishes: req.body }).then(
              favorites => {
                console.log('Favorite Created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
              },
              err => next(err),
            );
          }
        },
        err => next(err),
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(resp);
        },
        err => next(err),
      )
      .catch(err => next(err));
  });

favoriteRouter
  .route('/:dishId')
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorites => {
          if (favorites) {
            if (favorites.dishes.indexOf(req.params.dishId) === -1) {
              favorites.dishes.push(req.params.dishId);
              favorites.save().then(
                favorites => {
                  console.log('Favorite Created ', favorites);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorites);
                },
                err => next(err),
              );
            }
          } else {
            Favorites.create({ user: req.user._id, dishes: [req.params.dishId] }).then(
              favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              },
              err => next(err),
            );
          }
        },
        err => next(err),
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorites => {
          if (favorites) {
            index = favorites.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
              favorites.dishes.splice(index, 1);
              favorites.save().then(
                favorites => {
                  console.log('Favorite Deleted ', favorites);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorites);
                },
                err => next(err),
              );
            } else {
              err = new Error('Dish ' + req.params.dishId + ' not found');
              err.status = 404;
              return next(err);
            }
          } else {
            err = new Error('Favorite not found');
            err.status = 404;
            return next(err);
          }
        },
        err => next(err),
      )
      .catch(err => next(err));
  });

module.exports = favoriteRouter;
