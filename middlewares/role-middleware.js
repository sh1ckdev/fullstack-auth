const ApiError = require('../exceptions/api-error');

module.exports = function(requiredRoles = []) {
  return function(req, res, next) {
    try {
      const user = req.user;
      const userRoles = user?.roles || [];
      const allowed = requiredRoles.length === 0 || requiredRoles.some(r => userRoles.includes(r));
      if (!allowed) {
        return next(ApiError.Forbidden('Нет доступа'));
      }
      next();
    } catch (e) {
      next(ApiError.Forbidden('Нет доступа'));
    }
  }
}


