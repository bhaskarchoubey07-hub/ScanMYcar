const { pool, isUsingFileStore } = require('../config/storage');
const { readStore, withStore } = require('../config/fileStore');

const createUser = async ({ name, email, phone, passwordHash, role = 'user' }) => {
  if (isUsingFileStore()) {
    return withStore(async (data) => {
      const id = data.nextIds.users++;
      data.users.push({
        id,
        name,
        email,
        phone,
        password_hash: passwordHash,
        role,
        created_at: new Date().toISOString()
      });
      return id;
    });
  }

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [name, email, phone, passwordHash, role]
  );

  return result.rows[0].id;
};

const findUserByEmail = async (email) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return data.users.find((user) => user.email === email) || null;
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
};

const findUserByPhone = async (phone) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return data.users.find((user) => user.phone === phone) || null;
  }

  const result = await pool.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
  return result.rows[0] || null;
};

const findUserById = async (id) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    const user = data.users.find((entry) => entry.id === id);
    if (!user) {
      return null;
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  const result = await pool.query(
    'SELECT id, name, email, phone, role, is_blocked, failed_attempts, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rows[0] || null;
};

const updateLoginStats = async (userId) => {
  if (isUsingFileStore()) {
    return withStore(async (data) => {
      const idx = data.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        data.users[idx].failed_attempts = 0;
        data.users[idx].last_login_at = new Date().toISOString();
      }
    });
  }

  await pool.query(
    `UPDATE users 
     SET failed_attempts = 0, last_login_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [userId]
  );
};

const incrementFailedAttempts = async (email) => {
  if (isUsingFileStore()) {
    return withStore(async (data) => {
      const idx = data.users.findIndex(u => u.email === email);
      if (idx !== -1) {
        data.users[idx].failed_attempts = (data.users[idx].failed_attempts || 0) + 1;
        if (data.users[idx].failed_attempts >= 5) {
          data.users[idx].is_blocked = true;
        }
      }
    });
  }

  await pool.query(
    `UPDATE users 
     SET failed_attempts = failed_attempts + 1,
         is_blocked = CASE WHEN failed_attempts + 1 >= 5 THEN true ELSE is_blocked END
     WHERE email = $1`,
    [email]
  );
};

const listUsers = async () => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return [...data.users]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(({ password_hash, ...user }) => user);
  }

  const result = await pool.query(
    `SELECT id, name, email, phone, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  return result.rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByPhone,
  findUserById,
  updateLoginStats,
  incrementFailedAttempts,
  listUsers
};
