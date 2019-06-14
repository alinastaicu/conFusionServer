const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const Dish = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route('/')
  .all(authenticate.verifyUser)
  .get((req, res, next) => {
    Favorite.find({ postedBy: req.decoded._doc._id })
      .populate('postedBy')
      .populate('dishes')
      .exec((err, favorites) => {
        if (err) return err;
        res.json(favorites);
      });
  })

  .post((req, res, next) => {
    Favorite.find({ postedBy: req.decoded._doc._id }).exec((err, favorites) => {
      if (err) throw err;
      req.body.postedBy = req.decoded._doc._id;

      if (favorites.length) {
        var favoriteAlreadyExist = false;
        if (favorites[0].dishes.length) {
          for (var i = favorites[0].dishes.length - 1; i >= 0; i--) {
            favoriteAlreadyExist = favorites[0].dishes[i] == req.body._id;
            if (favoriteAlreadyExist) break;
          }
        }
        if (!favoriteAlreadyExist) {
          favorites[0].dishes.push(req.body._id);
          favorites[0].save((err, favorite) => {
            if (err) throw err;
            console.log('Um somethings up!');
            res.json(favorite);
          });
        } else {
          console.log('Setup!');
          res.json(favorites);
        }
      } else {
        Favorite.create({ postedBy: req.body.postedBy }, (err, favorite) => {
          if (err) throw err;
          favorite.dishes.push(req.body._id);
          favorite.save((err, favorite) => {
            if (err) throw err;
            console.log('Something is up!');
            res.json(favorite);
          });
        });
      }
    });
  })

  .delete((req, res, next) => {
    Favorite.remove({ postedBy: req.decoded._doc._id }, (err, resp) => {
      if (err) throw err;
      res.json(resp);
    });
  });

favoriteRouter
  .route('/:dishId')
  .all(authenticate.verifyUser)
  .delete((req, res, next) => {
    Favorite.find({ postedBy: req.decoded._doc._id }, (err, favorites) => {
      if (err) return err;
      var favorite = favorites ? favorites[0] : null;

      if (favorite) {
        for (var i = favorite.dishes.length - 1; i >= 0; i--) {
          if (favorite.dishes[i] == req.params.dishId) {
            favorite.dishes.remove(req.params.dishId);
          }
        }
        favorite.save((err, favorite) => {
          if (err) throw err;
          console.log('Here you go!');
          res.json(favorite);
        });
      } else {
        console.log('No favourites!');
        res.json(favorite);
      }
    });
  });

module.exports = favoriteRouter;
