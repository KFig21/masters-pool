import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true }, // e.g. "masters"
    year: { type: Number, required: true }, // e.g. 2026
    tournamentName: { type: String }, // e.g. "The Masters"
    data: { type: Array, required: true },
    lastUpdated: { type: Date, default: Date.now },
    tournamentMetadata: {
      cutScore: { type: Number },
      cutCount: { type: Number },
      currentRound: { type: Number },
      status: { type: String },
      course: { type: String },
      weather: {
        type: { type: String },
        displayValue: { type: String },
        conditionId: { type: String },
        zipCode: { type: String },
        temperature: { type: Number },
        lowTemperature: { type: Number },
        highTemperature: { type: Number },
        precipitation: { type: Number },
        gust: { type: Number },
        windSpeed: { type: Number },
        windDirection: { type: String },
        lastUpdated: { type: String },
      },
    },
  },
  { upsert: true },
);

// This ensures we only ever have ONE document per event/year
scoreSchema.index({ eventId: 1, year: 1 }, { unique: true });

export const Score = mongoose.model('Score', scoreSchema);
