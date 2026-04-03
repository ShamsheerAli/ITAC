import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Which client's chat room does this belong to?
  clientUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
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

export default mongoose.model('Message', messageSchema);