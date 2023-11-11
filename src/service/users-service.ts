import pool from "../database/db";

export async function getUser(userId: string) {
    return (await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0];
}

export async function getMessagesForUser(userId: string) {
    return (await pool.query('SELECT message_text AS text FROM messages WHERE user_id = $1', [userId])).rows;
}

export async function getLatestMessages() {
    return (await pool.query('SELECT message_text AS text FROM messages ORDER BY id DESC LIMIT 10', [])).rows;
}

export async function addNewMessage(newMessage: string, uid: string){
    return (await pool.query('INSERT INTO messages (message_text, user_id) VALUES ($1, $2)', [newMessage, uid]))
}