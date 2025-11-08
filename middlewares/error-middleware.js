const ApiError = require("../exceptions/api-error");

module.exports = function(err, req, res, next) {
    // Не логируем 401 ошибки для refresh как критичные - это нормальное поведение при истекшем токене
    if (err instanceof ApiError && err.status === 401 && req.path === '/refresh') {
        return res.status(err.status).json({ message: err.message, errors: err.errors });
    }

    if (err instanceof ApiError) {
        console.error('API Error:', err.message);
        return res.status(err.status).json({ message: err.message, errors: err.errors });
    }

    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Непредвиденная ошибка' });
};
