const mongoose = require('mongoose');

const clientNoteSchema = new mongoose.Schema({
  location_Id: {
    type: String,
    required: true
  },
  client_Id: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: true
  }
}, { timestamps: true });

const ClientNote = mongoose.model('ClientNote', clientNoteSchema);

module.exports = ClientNote;
