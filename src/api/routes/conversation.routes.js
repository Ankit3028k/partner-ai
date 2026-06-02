const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/conversation.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {validate}     = require('../middlewares/validate.middleware');

router.use(authenticate);

router.get ('/',          ctrl.list);
router.post('/',
  validate(Joi.object({title: Joi.string().max(120).optional()})),
  ctrl.create
);
router.get ('/:id',       ctrl.get);
router.patch('/:id',
  validate(Joi.object({title: Joi.string().max(120).required()})),
  ctrl.update
);
router.delete('/:id',     ctrl.delete);

router.get ('/:id/messages',  ctrl.getMessages);
router.post('/:id/messages',
  validate(Joi.object({
    role:     Joi.string().valid('user','assistant').required(),
    content:  Joi.string().min(1).max(8000).required(),
    audioUrl: Joi.string().uri().optional(),
  })),
  ctrl.addMessage
);

module.exports = router;
