const usageRepo = require('../../repositories/usage.repository');

const usageController = {
  log: async (req, res, next) => {
    try {
      await usageRepo.log({
        userId:   req.user.id,
        action:   req.body.action,
        metadata: req.body.metadata || {},
      });
      res.json({success: true});
    } catch (err) { next(err); }
  },

  stats: async (req, res, next) => {
    try {
      const data = await usageRepo.getStats(req.user.id, req.query.period);
      res.json({success: true, stats: data});
    } catch (err) { next(err); }
  },
};

module.exports = usageController;
