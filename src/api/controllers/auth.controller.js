const authService = require('../../services/auth.service');
const userRepo    = require('../../repositories/user.repository');

const authController = {
  verifyKey: async (req, res, next) => {
    try {
      const {apiKey} = req.body;
      const result   = await authService.verifyAndLogin(apiKey);
      res.json({success: true, ...result});
    } catch (err) { next(err); }
  },

  getProfile: async (req, res, next) => {
    try {
      const user = await userRepo.findById(req.user.id);
      res.json({success: true, user});
    } catch (err) { next(err); }
  },

  updateProfile: async (req, res, next) => {
    try {
      const user = await userRepo.update(req.user.id, req.body);
      res.json({success: true, user});
    } catch (err) { next(err); }
  },

  logout: async (req, res) => {
    res.json({success: true, message: 'Logged out.'});
  },
};

module.exports = authController;
