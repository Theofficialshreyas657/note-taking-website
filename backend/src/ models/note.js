
const db = require('../config/db');

class Note {
  static async create(noteData) {
    const { id, block_id, type } = noteData;
    
    let query = 'INSERT INTO notes (id, block_id, type';
    let values = [id, block_id, type];
    let placeholders = '?, ?, ?';
    switch (type) {
      case 'text':
        query += ', content';
        values.push(noteData.content);
        placeholders += ', ?';
        break;
      case 'image':
        query += ', image_url';
        values.push(noteData.imageUrl);
        placeholders += ', ?';
        break;
      case 'checkbox':
        query += ', checkbox_label, is_checked';
        values.push(noteData.label, noteData.checked);
        placeholders += ', ?, ?';
        break;
    }
    
    query += `) VALUES (${placeholders})`;
    
    const [result] = await db.query(query, values);
    return { id, ...noteData };
  }
  static async update(id, noteData) {
    const { type } = noteData;
    
    let query = 'UPDATE notes SET type = ?';
    let values = [type];
    switch (type) {
      case 'text':
        query += ', content = ?, image_url = NULL, checkbox_label = NULL, is_checked = NULL';
        values.push(noteData.content);
        break;
      case 'image':
        query += ', content = NULL, image_url = ?, checkbox_label = NULL, is_checked = NULL';
        values.push(noteData.imageUrl);
        break;
      case 'checkbox':
        query += ', content = NULL, image_url = NULL, checkbox_label = ?, is_checked = ?';
        values.push(noteData.label, noteData.checked);
        break;
    }
    
    query += ' WHERE id = ?';
    values.push(id);
    
    const [result] = await db.query(query, values);
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    const [result] = await db.query(`
      DELETE FROM notes WHERE id = ?
    `, [id]);
    
    return result.affectedRows > 0;
  }
  
  static async toggleCheckbox(id, isChecked) {
    const [result] = await db.query(`
      UPDATE notes SET is_checked = ? WHERE id = ? AND type = 'checkbox'
    `, [isChecked, id]);
    
    return result.affectedRows > 0;
  }
}

module.exports = Note;