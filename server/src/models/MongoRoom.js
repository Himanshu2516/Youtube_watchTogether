import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    hostUserId: {
      type: String,
      required: true
    },
    lastVideoId: {
      type: String,
      default: 'jfKfPfyJRdk'
    },
    participantCount: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

export const MongoRoom = mongoose.model('Room', RoomSchema);
