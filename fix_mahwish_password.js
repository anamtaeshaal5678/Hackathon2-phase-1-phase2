const crypto = require('crypto');
const Database = require('better-sqlite3');
const path = require('path');

// Hash password using the same method as better-auth
function hashPassword(password) {
    // better-auth uses bcrypt-like hashing
    // For this fix, we'll use a simple approach that matches better-auth's expectations
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

async function fixPassword() {
    const dbPath = path.join(__dirname, 'todo.db');
    const db = new Database(dbPath);

    const email = 'mahwishkhan56789@gmail.com';
    const password = '13octuber92';

    console.log('Fixing password for:', email);

    // Get user ID
    const user = db.prepare('SELECT id FROM user WHERE email = ?').get(email);

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    console.log('User ID:', user.id);

    // Hash the password
    const hashedPassword = hashPassword(password);
    console.log('Password hashed successfully');

    // Check if account entry exists
    const existingAccount = db.prepare('SELECT * FROM account WHERE userId = ?').get(user.id);

    if (existingAccount) {
        // Update existing account
        console.log('Updating existing account entry...');
        db.prepare('UPDATE account SET password = ? WHERE userId = ?').run(hashedPassword, user.id);
    } else {
        // Create new account entry
        console.log('Creating new account entry...');
        const accountId = crypto.randomBytes(16).toString('hex');
        db.prepare(`
            INSERT INTO account (id, userId, accountId, providerId, password, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            accountId,
            user.id,
            email,
            'credential',
            hashedPassword,
            new Date().toISOString(),
            new Date().toISOString()
        );
    }

    console.log('✓ Password fixed successfully!');
    console.log('You can now sign in with:');
    console.log('  Email:', email);
    console.log('  Password:', password);

    db.close();
}

fixPassword().catch(console.error);
