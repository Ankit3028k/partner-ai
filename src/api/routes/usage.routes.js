const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/usage.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {validate}     = require('../middlewares/validate.middleware');

router.use(authenticate);

router.post('/log',
  validate(Joi.object({
    action:   Joi.string().max(100).required(),
    metadata: Joi.object().optional(),
  })),
  ctrl.log
);
router.get('/stats', ctrl.stats);

module.exports = router;
