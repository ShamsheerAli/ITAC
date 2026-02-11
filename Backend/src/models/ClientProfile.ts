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
  sicCode: string;
  naics: string;
  description: string;
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
  sicCode: { type: String },
  naics: { type: String },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model<IClientProfile>('ClientProfile', ClientProfileSchema);