const convService = require('../../services/conversation.service');

const conversationController = {
  list: async (req, res, next) => {
    try {
      const data = await convService.list(req.user.id, {
        limit:  Number(req.query.limit)  || 20,
        offset: Number(req.query.offset) || 0,
      });
      res.json({success: true, conversations: data});
    } catch (err) { next(err); }
  },

  get: async (req, res, next) => {
    try {
      const data = await convService.get(req.params.id, req.user.id);
      res.json({success: true, conversation: data});
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const data = await convService.create(req.user.id, req.body);
      res.status(201).json({success: true, conversation: data});
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const data = await convService.update(req.params.id, req.user.id, req.body);
      res.json({success: true, conversation: data});
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      await convService.delete(req.params.id, req.user.id);
      res.json({success: true, message: 'Deleted.'});
    } catch (err) { next(err); }
  },

  getMessages: async (req, res, next) => {
    try {
      const msgs = await convService.getMessages(req.params.id, req.user.id, {
        limit:  Number(req.query.limit)  || 100,
        offset: Number(req.query.offset) || 0,
      });
      res.json({success: true, messages: msgs});
    } catch (err) { next(err); }
  },

  addMessage: async (req, res, next) => {
    try {
      const msg = await convService.addMessage(req.params.id, req.user.id, req.body);
      res.status(201).json({success: true, message: msg});
    } catch (err) { next(err); }
  },
};

module.exports = conversationController;
