import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the Interface (For TypeScript)
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'client' | 'staff' | 'admin';
  createdAt: Date;
}

// 2. Define the Schema (For MongoDB)
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client', 'staff', 'admin'], default: 'client' },
  createdAt: { type: Date, default: Date.now },
});

// 3. Export the Model
export default mongoose.model<IUser>('User', UserSchema);