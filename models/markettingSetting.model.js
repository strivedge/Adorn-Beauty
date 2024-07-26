const mongoose = require('mongoose');

const marketingSettingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    enum: ['company', 'location'],
    required: true
  }
});

const MarketingSetting = mongoose.model('MarketingSetting', marketingSettingSchema);

module.exports = MarketingSetting;
