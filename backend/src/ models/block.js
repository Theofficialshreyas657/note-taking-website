
const db = require('../config/db');

class Block {
  
  static async getAll(user_id) {
    const [blocks] = await db.query(`
      SELECT * FROM blocks WHERE user_id = ? ORDER BY created_at DESC
    `, [user_id]);

    for (const block of blocks) {
      const [notes] = await db.query(`
        SELECT * FROM notes WHERE block_id = ? ORDER BY created_at ASC
      `, [block.id]);

      block.notes = notes.map(note => {
        const transformedNote = {
          id: note.id,
          type: note.type
        };

        switch (note.type) {
          case 'text':
            transformedNote.content = note.content;
            break;
          case 'image':
            transformedNote.imageUrl = note.image_url;
            break;
          case 'checkbox':
            transformedNote.label = note.checkbox_label;
            transformedNote.checked = !!note.is_checked;
            break;
        }

        return transformedNote;
      });
    }

    return blocks;
  }

  
  static async create({ id, title, user_id }) {
    const [result] = await db.query(
      'INSERT INTO blocks (id, title, user_id) VALUES (?, ?, ?)',
      [id, title, user_id]
    );
    return { id, title, user_id };
  }
  static async update(id, blockData) {
    const { title } = blockData;

    const [result] = await db.query(`
      UPDATE blocks SET title = ? WHERE id = ?
    `, [title, id]);

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query(`
      DELETE FROM blocks WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
  }

  static async getById(id) {
    const [blocks] = await db.query(`
      SELECT * FROM blocks WHERE id = ?
    `, [id]);

    if (blocks.length === 0) {
      return null;
    }

    const block = blocks[0];

    const [notes] = await db.query(`
      SELECT * FROM notes WHERE block_id = ? ORDER BY created_at ASC
    `, [id]);

    block.notes = notes.map(note => {
      const transformedNote = {
        id: note.id,
        type: note.type
      };

      switch (note.type) {
        case 'text':
          transformedNote.content = note.content;
          break;
        case 'image':
          transformedNote.imageUrl = note.image_url;
          break;
        case 'checkbox':
          transformedNote.label = note.checkbox_label;
          transformedNote.checked = !!note.is_checked;
          break;
      }

      return transformedNote;
    });

    return block;
  }
}

module.exports = Block;
