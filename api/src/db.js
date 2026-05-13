import pgPromise from 'pg-promise';

const pgp = pgPromise();
let connection;

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Add it to api/.env or set it in your shell before using database routes.');
  }

  connection ||= pgp(process.env.DATABASE_URL);
  return connection;
}

export const db = new Proxy({}, {
  get(_target, property) {
    const database = getDb();
    const value = database[property];
    return typeof value === 'function' ? value.bind(database) : value;
  }
});
