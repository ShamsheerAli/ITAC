"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ClientProfileSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String },
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    buildingSize: { type: String },
    utilityExpenses: { type: String },
    energyConsumption: { type: String },
    isGrossSalesLessThan250M: { type: String },
    grossSales: { type: String },
    businessDescription: { type: String },
    naics: { type: String },
    description: { type: String },
    status: { type: String, default: 'New Inquiry' },
    statusUpdatedAt: { type: Date, default: Date.now },
    documents: [
        {
            name: { type: String },
            originalName: { type: String },
            path: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    serviceType: { type: String, default: "" },
    naturalGasProvider: { type: String },
    electricityProvider: { type: String },
    naturalGasTransporter: { type: String },
    referredBy: { type: String, default: "" },
    isArchived: { type: Boolean, default: false },
    proposedAuditDates: {
        type: [String], // Array of strings to hold the dates (e.g., ["2026-04-10", "2026-04-15"])
        default: []
    },
    auditNotes: {
        type: String,
        default: ""
    },
    confirmedAuditDate: {
        type: String,
        default: ""
    },
    isAuditConfirmed: {
        type: Boolean,
        default: false
    },
    position: { type: String },
    linkedIn: { type: String },
    facebook: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model('ClientProfile', ClientProfileSchema);
