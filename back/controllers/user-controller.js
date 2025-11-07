const UserService = require("../service/user-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");
const userService = require("../service/user-service");
const UserModel = require("../models/user-modal");

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                next(ApiError.BadRequest("Ошибка валидации", errors.array()));
            }
            const { username, email, password } = req.body;
            const userData = await UserService.registration(
                username,
                email,
                password
            );

            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                path: '/',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const userData = await UserService.login(username, password);
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                path: '/',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }
    async loginWithYandex(req, res, next) {
        try {
            const { code, redirectUri } = req.body;
            const userData = await UserService.loginWithYandex(code, redirectUri);
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                path: '/',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie("refreshToken");
            return res.json(token);
        } catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return next(ApiError.UnauthorizedError());
            }
            const userData = await userService.refresh(refreshToken);
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                path: '/',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production'
            });
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }
    
    async getUsers(req, res, next) {
        try {
            const users = await UserModel.find({});
            res.json(users);
        } catch (error) {
            next(error);
        }
    }
    
    async me(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id).select('-password');
            if (!user) return next(ApiError.NotFound('Пользователь не найден'));
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateMe(req, res, next) {
        try {
            const fieldsToUpdate = req.body || {};
            const userId = req.user.id;
            const updatedUser = await userService.updateProfile(fieldsToUpdate, userId);
            return res.json({ message: 'Profile updated successfully', user: updatedUser });
        } catch (error) {
            next(error);
        }
    }


    async updateProfile(req, res, next) {
        try {
            const { fieldsToUpdate } = req.body;
            const { userId } = req.params;
            const updatedUser = await userService.updateProfile(
                fieldsToUpdate,
                userId
            );

            return res.json({
                message: "Profile updated successfully",
                user: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    }

    // async deleteUser(req, res, next) {
    //     try {
    //         const { userId } = req.params;
    //         await userService.deleteUser(userId)
    //         return res.json({
    //             message: "Пользователь удален",
    //         });
    //     } catch (error) {
            
    //     }
    // }
    async getUser(req, res, next) {
        try {
            const { username } = req.params;
            const user = await userService.getUser(username)
            
            if (!user) {
                return res.status(404).json({ message: "Пользователь не найден" });
            }
    
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return next(ApiError.BadRequest('Email обязателен'));
            }
            const result = await userService.requestPasswordReset(email);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return next(ApiError.BadRequest('Токен и пароль обязательны'));
            }
            if (password.length < 6) {
                return next(ApiError.BadRequest('Пароль должен содержать минимум 6 символов'));
            }
            const result = await userService.resetPassword(token, password);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
