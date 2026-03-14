const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'dev-db.json');

const defaultData = () => ({
  users: [],
  vehicles: [],
  scans: [],
  nextIds: {
    users: 1,
    vehicles: 1,
    scans: 1
  }
});

let writeQueue = Promise.resolve();

const ensureStore = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });

  try {
    await fs.promises.access(dataFile);
  } catch (error) {
    await fs.promises.writeFile(dataFile, JSON.stringify(defaultData(), null, 2));
  }
};

const readStore = async () => {
  await ensureStore();
  const content = await fs.promises.readFile(dataFile, 'utf8');
  return JSON.parse(content);
};

const writeStore = async (data) => {
  await fs.promises.writeFile(dataFile, JSON.stringify(data, null, 2));
};

const withStore = async (updater) => {
  writeQueue = writeQueue.then(async () => {
    const data = await readStore();
    const result = await updater(data);
    await writeStore(data);
    return result;
  });

  return writeQueue;
};

module.exports = {
  ensureStore,
  readStore,
  withStore
};
