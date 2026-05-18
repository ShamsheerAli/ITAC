import mongoose, { Schema, Document } from 'mongoose';

export interface IClientProfile extends Document {
  user: mongoose.Types.ObjectId; // CHANGED THIS
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  buildingSize: string;
  utilityExpenses: string;
  energyConsumption: string;
  grossSales: string;
  businessDescription: string;
  naics: string;
  description: string;
  status: string;
  documents: {
    name: string;
    path: string;
    uploadedAt: Date;
  }[];
  serviceType: string;
  naturalGasProvider: string;
  electricityProvider: string;
  naturalGasTransporter: string;
  referredBy?: string;
  isArchived?: boolean;
}

const ClientProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  grossSales: { type: String },
  businessDescription: { type: String },
  naics: { type: String },
  description: { type: String },
  status: { type: String, default: 'New Inquiry' },
  documents: [
    {
      name: { type: String },
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
  }

}, { timestamps: true });

export default mongoose.model<IClientProfile>('ClientProfile', ClientProfileSchema);