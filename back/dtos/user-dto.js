module.exports = class UserDto {
    username;
    email;
    id;
    roles;
    avatarUrl;
    yandexId;
    constructor(model){
        this.username = model.username
        this.email = model.email
        this.id = model._id
        this.roles = model.roles || []
        this.avatarUrl = model.avatarUrl || null
        this.yandexId = model.yandexId || null
    }
}