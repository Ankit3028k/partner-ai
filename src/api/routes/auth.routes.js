const router     = require('express').Router();
const Joi        = require('joi');
const ctrl       = require('../controllers/auth.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {validate}     = require('../middlewares/validate.middleware');

router.post('/verify-key',
  validate(Joi.object({apiKey: Joi.string().min(10).required()})),
  ctrl.verifyKey
);

router.get ('/profile', authenticate, ctrl.getProfile);
router.patch('/profile', authenticate,
  validate(Joi.object({name: Joi.string().optional(), avatarUrl: Joi.string().uri().optional()})),
  ctrl.updateProfile
);
router.post('/logout', authenticate, ctrl.logout);

module.exports = router;
