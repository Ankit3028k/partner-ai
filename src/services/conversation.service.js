const convRepo  = require('../repositories/conversation.repository');
const usageRepo = require('../repositories/usage.repository');

const conversationService = {
  list: async (userId, params) => {
    const convs = await convRepo.findByUser(userId, params);
    return convs;
  },

  get: async (id, userId) => {
    const conv = await convRepo.findById(id, userId);
    if (!conv) throw Object.assign(new Error('Conversation not found.'), {status: 404});
    return conv;
  },

  create: async (userId, {title}) => {
    return convRepo.create({userId, title});
  },

  update: async (id, userId, body) => {
    const conv = await convRepo.update(id, userId, body);
    if (!conv) throw Object.assign(new Error('Conversation not found.'), {status: 404});
    return conv;
  },

  delete: async (id, userId) => {
    const deleted = await convRepo.delete(id, userId);
    if (!deleted) throw Object.assign(new Error('Conversation not found.'), {status: 404});
  },

  getMessages: async (id, userId, params) => {
    // Verify ownership
    await conversationService.get(id, userId);
    return convRepo.getMessages(id, params);
  },

  addMessage: async (id, userId, {role, content, audioUrl}) => {
    await conversationService.get(id, userId);
    const msg = await convRepo.addMessage({conversationId: id, role, content, audioUrl});
    // Log usage
    await usageRepo.log({userId, action: 'message_sent', metadata: {role}}).catch(() => {});
    return msg;
  },
};

module.exports = conversationService;
