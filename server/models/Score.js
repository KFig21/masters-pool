import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true }, // e.g. "masters"
    year: { type: Number, required: true }, // e.g. 2026
    tournamentName: { type: String }, // e.g. "The Masters"
    data: { type: Array, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { upsert: true },
);

// This ensures we only ever have ONE document per event/year
scoreSchema.index({ eventId: 1, year: 1 }, { unique: true });

export const Score = mongoose.model('Score', scoreSchema);
