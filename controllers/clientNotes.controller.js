const clientNoteService = require('../services/clientNotes.service');

// Controller function to handle creating a new client note
async function createClientNote(req, res) {
  const { location_Id, client_Id, notes } = req.body;
  try {
    const savedNote = await clientNoteService.createClientNote(location_Id, client_Id, notes);
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Controller function to handle getting all client notes for a specific location and client
async function getClientNotes(req, res) {
  const { location_Id, client_Id } = req.params;
  try {
    const notes = await clientNoteService.getClientNotes(location_Id, client_Id);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Controller function to handle updating a client note
async function updateClientNote(req, res) {
  const { id } = req.params;
  const { notes } = req.body;
  try {
    const updatedNote = await clientNoteService.updateClientNote(id, notes);
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Controller function to handle deleting a client note
async function deleteClientNote(req, res) {
  const { id } = req.params;
  try {
    const deletedNote = await clientNoteService.deleteClientNote(id);
    res.json(deletedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createClientNote,
  getClientNotes,
  updateClientNote,
  deleteClientNote
};
