const routes = require('express').Router();
const userControllers = require('../db/controllers/userCtrl.js');
const s3Controller = require('../db/controllers/s3Ctrl.js');
const challengeController = require('../db/controllers/challengeCtrl.js');
const commentController = require('../db/controllers/commentCtrl.js');
const followerController = require('../db/controllers/followerCtrl.js');

routes.post('/signup', userControllers.signup);
routes.post('/login', userControllers.login);
routes.get('/logout', userControllers.logout);
routes.post('/userUpload', s3Controller);
routes.get('/allChallenges', challengeController.getAll);
routes.post('/challenge', challengeController.addOne);
routes.post('/s3', challengeController.s3);
routes.get('/challenge/:id', challengeController.getOne);
routes.post('/comments', commentController.addOne);
routes.get('/comments', commentController.getAll);
routes.post('/upvote', challengeController.upvote);
routes.post('/viewed', challengeController.viewed);
routes.post('/response', challengeController.addOneResponse);
routes.get('/response', challengeController.getOne);
routes.get('/profile', userControllers.getUser);
routes.post('/follower', followerController.follow);
routes.get('/getLeaders', followerController.getLeaders);
routes.post('/unFollow', followerController.unFollow);

module.exports = routes;