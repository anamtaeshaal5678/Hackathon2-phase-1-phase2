const Database = require('better-sqlite3');
const path = require('path');

// todo.db is in the parent directory of frontend
const dbPath = path.resolve(__dirname, '../todo.db');
const db = new Database(dbPath);

const email = 'mahwishkhan56789@gmail.com';

try {
    // 1. Get User ID
    const user = db.prepare('SELECT id FROM user WHERE email = ?').get(email);

    if (!user) {
        console.log(`User not found: ${email}`);
    } else {
        const userId = user.id;
        console.log(`Found user: ${email} (ID: ${userId})`);

        // 2. Delete Dependencies
        try {
            const delSessions = db.prepare('DELETE FROM session WHERE userId = ?').run(userId);
            console.log(`Deleted ${delSessions.changes} sessions.`);
        } catch (e) { console.log('Error deleting sessions:', e.message); }

        try {
            const delTodos = db.prepare('DELETE FROM todo WHERE user_id = ?').run(userId);
            console.log(`Deleted ${delTodos.changes} todos.`);
        } catch (e) { console.log('Error deleting todos:', e.message); }

        try {
            // better-auth usually has an account table
            const delAccounts = db.prepare('DELETE FROM account WHERE userId = ?').run(userId);
            console.log(`Deleted ${delAccounts.changes} accounts.`);
        } catch (e) { console.log('Error deleting accounts (table might not exist):', e.message); }

        // 3. Delete User
        const delUser = db.prepare('DELETE FROM user WHERE id = ?').run(userId);
        console.log(`Deleted user: ${email} (Changes: ${delUser.changes})`);
    }

} catch (err) {
    console.error('Error during deletion:', err.message);
} finally {
    db.close();
}
