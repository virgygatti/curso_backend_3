const userService = require('../services/userService');
const path = require('path');

async function uploadDocuments(req, res, next) {
  try {
    const { uid } = req.params;
    const user = await userService.getById(uid);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron archivos' });
    }
    const docs = files.map((f) => ({
      name: f.originalname || f.filename,
      reference: path.join('uploads', 'documents', f.filename)
    }));
    const updated = await userService.addDocuments(uid, docs);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadDocuments
};
