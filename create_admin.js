const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
    const email = 'admin@menteabundante.com';
    const password = 'admin123'; // Puedes cambiar esto
    const name = 'Admin';

    try {
        await client.connect();

        // Verificar si existe
        const checkRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            console.log('El usuario admin ya existe');

            // Actualizar rol si ya existe pero no es admin
            await client.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
            console.log('Rol actualizado a admin');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await client.query(
            `INSERT INTO users (email, password_hash, name, role)
             VALUES ($1, $2, $3, 'admin')`,
            [email, passwordHash, name]
        );

        console.log(`Usuario administrador creado exitosamente:
Email: ${email}
Password: ${password}`);

    } catch (err) {
        console.error('Error creando admin:', err);
    } finally {
        await client.end();
    }
}

createAdmin();
