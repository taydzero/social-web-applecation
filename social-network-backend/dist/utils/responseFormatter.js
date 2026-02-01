"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUsers = exports.formatMessages = exports.formatMessage = exports.formatUser = void 0;
const formatUser = (user) => {
    if (!user)
        return null;
    return {
        _id: user.id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
};
exports.formatUser = formatUser;
const formatMessage = (message) => {
    if (!message)
        return null;
    return {
        _id: message.id.toString(),
        from: (0, exports.formatUser)(message.fromUser),
        to: (0, exports.formatUser)(message.toUser),
        content: message.content,
        timestamp: message.timestamp,
    };
};
exports.formatMessage = formatMessage;
const formatMessages = (messages) => {
    return messages.map(exports.formatMessage);
};
exports.formatMessages = formatMessages;
const formatUsers = (users) => {
    return users.map(exports.formatUser);
};
exports.formatUsers = formatUsers;
