const ClientNote = require('../models/clientNotes.model');

// Create a new client note
async function createClientNote(location_Id, client_Id, notes) {
  try {
    const newNote = new ClientNote({
      location_Id,
      client_Id,
      notes
    });
    const savedNote = await newNote.save();
    return savedNote;
  } catch (error) {
    throw error;
  }
}

// Get the latest 10 client notes for a specific location and client
async function getClientNotes(location_Id, client_Id) {
  try {
    const notes = await ClientNote.find({ location_Id, client_Id }).sort({ createdAt: -1 }).limit(10);
    return notes;
  } catch (error) {
    throw error;
  }
}


// Update a client note
async function updateClientNote(noteId, notes) {
  try {
    const updatedNote = await ClientNote.findByIdAndUpdate(noteId, { notes }, { new: true });
    return updatedNote;
  } catch (error) {
    throw error;
  }
}

// Delete a client note
async function deleteClientNote(noteId) {
  try {
    const deletedNote = await ClientNote.findByIdAndDelete(noteId);
    return deletedNote;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createClientNote,
  getClientNotes,
  updateClientNote,
  deleteClientNote
};
