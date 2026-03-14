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

  const [result] = await pool.execute(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, passwordHash, role]
  );

  return result.insertId;
};

const findUserByEmail = async (email) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return data.users.find((user) => user.email === email) || null;
  }

  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    const user = data.users.find((entry) => entry.id === Number(id));
    if (!user) {
      return null;
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  const [rows] = await pool.execute(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const listUsers = async () => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return [...data.users]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(({ password_hash, ...user }) => user);
  }

  const [rows] = await pool.execute(
    `SELECT id, name, email, phone, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );
  return rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  listUsers
};
