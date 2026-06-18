import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  leadSource?: string;
  variationType?: string;
  fundingType?: string;
  extraInfo?: string;
  createdAt: Date;
  isArchived: boolean;
}

const LeadSchema: Schema = new Schema({
  companyName: { type: String, required: true },
  contactName: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  leadSource: { type: String },
  variationType: { type: String },
  fundingType: { type: String },
  extraInfo: { type: String },
  createdAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
});

export default mongoose.model<ILead>('Lead', LeadSchema);