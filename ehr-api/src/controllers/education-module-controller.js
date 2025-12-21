const { v4: uuidv4 } = require('uuid');

/**
 * Education Module Controller
 * Handles CRUD operations for prenatal education modules
 */

const getAll = async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM education_modules ORDER BY created_at DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching education modules:', error);
    res.status(500).json({ error: 'Failed to fetch education modules' });
  }
};

const create = async (req, res) => {
  try {
    const id = uuidv4();
    const now = new Date();
    const {
      title,
      description,
      category,
      trimester,
      contentType,
      duration,
      required = false,
      url
    } = req.body;

    const result = await req.db.query(
      `INSERT INTO education_modules
       (id, title, description, category, trimester, "contentType", duration, required, url, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [id, title, description, category, trimester, contentType, duration, required, url, now, now]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating education module:', error);
    res.status(500).json({ error: 'Failed to create education module' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const {
      title,
      description,
      category,
      trimester,
      contentType,
      duration,
      required,
      url
    } = req.body;

    const result = await req.db.query(
      `UPDATE education_modules
       SET title = $1, description = $2, category = $3, trimester = $4,
           "contentType" = $5, duration = $6, required = $7, url = $8, "updatedAt" = $9
       WHERE id = $10
       RETURNING *`,
      [title, description, category, trimester, contentType, duration, required, url, now, id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Education module not found' });
    }
  } catch (error) {
    console.error('Error updating education module:', error);
    res.status(500).json({ error: 'Failed to update education module' });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      'DELETE FROM education_modules WHERE id = $1',
      [id]
    );

    if (result.rowCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Education module not found' });
    }
  } catch (error) {
    console.error('Error deleting education module:', error);
    res.status(500).json({ error: 'Failed to delete education module' });
  }
};

module.exports = {
  getAll,
  create,
  update,
  delete: deleteModule,
};
