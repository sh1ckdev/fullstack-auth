const UserModel = require('../models/user-modal');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const crypto = require('crypto');
const axios = require('axios');

const normalizeYandexAvatarUrl = (value) => {
    if (!value) {
        return null;
    }

    let candidate = value.trim ? value.trim() : value;

    if (!candidate) {
        return null;
    }

    if (!/^https?:\/\//i.test(candidate)) {
        candidate = `https://avatars.mds.yandex.net/get-yapic/${candidate}/islands-200`;
    }

    try {
        const parsed = new URL(candidate);

        if (!parsed.hostname.includes('yandex') || !parsed.pathname.includes('/get-yapic/')) {
            return candidate;
        }

        const segments = parsed.pathname.split('/').filter(Boolean);
        const getYapicIndex = segments.indexOf('get-yapic');

        if (getYapicIndex === -1 || segments.length - getYapicIndex < 3) {
            return candidate;
        }

        const group = segments[getYapicIndex + 1];
        const identifierSegments = segments.slice(getYapicIndex + 2, segments.length - 1);
        const identifier = identifierSegments.join('/') || segments[getYapicIndex + 2];
        const sizeSegment = segments[segments.length - 1] || 'islands-200';
        const normalizedSize = sizeSegment.replace(/^islands-retina-/, 'islands-') || 'islands-200';

        return `https://avatars.mds.yandex.net/get-yapic/${group}/${identifier}/${normalizedSize}`;
    } catch (error) {
        console.warn('Failed to normalize Yandex avatar url', error);
        return candidate;
    }
};

class UserService {
    async registration(username, email, password) { 
        const candidate = await UserModel.findOne({ $or: [{ username }, { email }] });
        if (candidate) {
            throw ApiError.BadRequest('Пользователь уже существует');
        }
        const hashedPassword = await bcrypt.hash(password, 3);
        const baseRoles = username === 'admin' ? ['user','admin'] : ['user'];
        const user = await UserModel.create({ username, email, password: hashedPassword, roles: baseRoles, lastLoginProvider: 'local' });

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        };
    }
    async login(username, password) {
        const user = await UserModel.findOne({ username });
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким никнеймом не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }

        if (user.lastLoginProvider !== 'local') {
            user.lastLoginProvider = 'local';
            await user.save();
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto };
    }


    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
async refresh(refreshToken) {

    if (!refreshToken) {
        throw ApiError.UnauthorizedError();
    }

    const userData = await tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
}

    async updateProfile(fieldsToUpdate, userId) {
        try {
            const currentUser = await UserModel.findById(userId);
    
            if (!currentUser) {
                throw ApiError.NotFound('Пользователь не найден');
            }
    
            const { username, password, email } = fieldsToUpdate;
            const updatedFields = {
                username: (username && username.trim()) || currentUser.username,
                email: (email && email.trim()) || currentUser.email,
                password: (password && password.trim()) || currentUser.password,
            };
            

            const newUsername = updatedFields.username;
    
            if (newUsername && newUsername !== currentUser.username) {
                const existingUser = await UserModel.findOne({ username: newUsername });
    
                if (existingUser) {
                    throw ApiError.BadRequest('Никнейм уже используется');
                }
            }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 3); 
                updatedFields.password = hashedPassword;
            }
    
            Object.assign(currentUser, updatedFields);
    
            await currentUser.save();
    
            const userDto = new UserDto(currentUser);
            return userDto 
        } catch (error) {
            throw error;
        }
    }  

    async deleteUser(userId) {
        try {
            const deletedUser = await UserModel.findByIdAndDelete(userId);
            return deletedUser;
        } catch (error) {
            
        }
    }

    async getUser(username){
        try {
            const user = await UserModel.findOne({username}).select("-password -email -refreshToken");
            console.log(user)
            return user;
        } catch(error) {

        }
    }

    async requestPasswordReset(email) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            // Не раскрываем, существует ли пользователь с таким email
            return { message: 'Если пользователь с таким email существует, на него будет отправлена инструкция по сбросу пароля' };
        }

        // Генерируем токен для сброса пароля
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Токен действителен 1 час

        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await user.save();

        // В реальном приложении здесь должна быть отправка email
        // Для примера просто возвращаем токен (в проде нужно удалить)
        return { 
            message: 'Если пользователь с таким email существует, на него будет отправлена инструкция по сбросу пароля',
            resetToken // В проде удалить - только для разработки
        };
    }

    async resetPassword(token, newPassword) {
        const user = await UserModel.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: new Date() } // Токен еще не истек
        });

        if (!user) {
            throw ApiError.BadRequest('Недействительный или истекший токен сброса пароля');
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 3);
        
        // Обновляем пароль и очищаем токен
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        return { message: 'Пароль успешно изменен' };
    }

    async loginWithYandex(code, redirectUri) {
        if (!code) {
            throw ApiError.BadRequest('Код авторизации Yandex ID не передан');
        }

        const clientId = process.env.YANDEX_CLIENT_ID;
        const clientSecret = process.env.YANDEX_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw ApiError.BadRequest('Интеграция с Yandex ID не настроена на сервере');
        }

        try {
            const tokenPayload = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
            });

            if (redirectUri) {
                tokenPayload.append('redirect_uri', redirectUri);
            }

            const tokenResponse = await axios.post('https://oauth.yandex.ru/token', tokenPayload.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const accessToken = tokenResponse.data?.access_token;
            if (!accessToken) {
                throw ApiError.BadRequest('Не удалось получить access token Yandex ID');
            }

            const userInfoResponse = await axios.get('https://login.yandex.ru/info?format=json', {
                headers: { Authorization: `OAuth ${accessToken}` }
            });

            const yandexData = userInfoResponse.data || {};
            const yandexId = yandexData.id || yandexData.uid;

            if (!yandexId) {
                throw ApiError.BadRequest('Не удалось получить идентификатор пользователя Yandex');
            }

            const primaryEmail = yandexData.default_email || (Array.isArray(yandexData.emails) ? yandexData.emails[0] : null);
            const fallbackEmail = `${yandexId}@yandex.local`;
            const email = primaryEmail || fallbackEmail;

            let user = await UserModel.findOne({ yandexId });

            if (!user && primaryEmail) {
                user = await UserModel.findOne({ email: primaryEmail });
            }

            const resolvedAvatarUrl = normalizeYandexAvatarUrl(
                yandexData.default_avatar_id || user?.avatarUrl || null
            );

            if (!user) {
                const loginBaseRaw = yandexData.login || yandexData.display_name || `yandex_${yandexId}`;
                const loginBase = (loginBaseRaw || `yandex_${crypto.randomBytes(4).toString('hex')}`).replace(/\s+/g, '').toLowerCase();

                let usernameCandidate = loginBase;
                let suffix = 1;
                // eslint-disable-next-line no-await-in-loop
                while (await UserModel.exists({ username: usernameCandidate })) {
                    usernameCandidate = `${loginBase}_${suffix}`;
                    suffix += 1;
                }

                const randomPassword = crypto.randomBytes(16).toString('hex');
                const hashedPassword = await bcrypt.hash(randomPassword, 3);

                user = await UserModel.create({
                    username: usernameCandidate,
                    email,
                    password: hashedPassword,
                    roles: ['user'],
                    yandexId,
                    avatarUrl: resolvedAvatarUrl,
                    lastLoginProvider: 'yandex'
                });
            } else {
                let needSave = false;
                if (!user.yandexId) {
                    user.yandexId = yandexId;
                    needSave = true;
                }
                if (resolvedAvatarUrl && user.avatarUrl !== resolvedAvatarUrl) {
                    user.avatarUrl = resolvedAvatarUrl;
                    needSave = true;
                }
                if (user.lastLoginProvider !== 'yandex') {
                    user.lastLoginProvider = 'yandex';
                    needSave = true;
                }
                if (needSave) {
                    await user.save();
                }
            }

            const userDto = new UserDto(user);
            const tokens = tokenService.generateTokens({ ...userDto });
            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            return { ...tokens, user: userDto };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            const message = error?.response?.data?.error_description || error?.message || 'Ошибка авторизации через Yandex ID';
            throw ApiError.BadRequest(message);
        }
    }
}

module.exports = new UserService();
