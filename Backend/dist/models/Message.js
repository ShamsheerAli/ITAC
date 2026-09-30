"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    // Which client's chat room does this belong to?
    clientUserId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Who sent it? 
    senderRole: {
        type: String,
        enum: ['client', 'staff'],
        required: true
    },
    // The actual message
    text: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Message', messageSchema);
