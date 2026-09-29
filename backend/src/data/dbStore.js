import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'resqgrid.db.json');

class DocumentCollection {
  constructor(name, getDatabase, saveDatabase) {
    this.name = name;
    this.getDatabase = getDatabase;
    this.saveDatabase = saveDatabase;
  }

  _getItems() {
    const db = this.getDatabase();
    if (!db[this.name]) {
      db[this.name] = [];
    }
    return db[this.name];
  }

  _matchesQuery(item, query = {}) {
    if (!query || Object.keys(query).length === 0) return true;
    for (const [key, val] of Object.entries(query)) {
      if (key === '_id') {
        const itemId = item._id ? item._id.toString() : '';
        const targetId = val ? val.toString() : '';
        if (itemId !== targetId) return false;
      } else if (key === '$or' && Array.isArray(val)) {
        const matchesAny = val.some(subQuery => this._matchesQuery(item, subQuery));
        if (!matchesAny) return false;
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        if ('$in' in val && Array.isArray(val.$in)) {
          const itemVal = item[key];
          if (Array.isArray(itemVal)) {
            const hasIntersection = itemVal.some(v => val.$in.includes(v));
            if (!hasIntersection) return false;
          } else if (!val.$in.includes(itemVal)) {
            return false;
          }
        }
        if ('$ne' in val) {
          if (item[key] === val.$ne) return false;
        }
        if ('$gt' in val && !(item[key] > val.$gt)) return false;
        if ('$gte' in val && !(item[key] >= val.$gte)) return false;
        if ('$lt' in val && !(item[key] < val.$lt)) return false;
        if ('$lte' in val && !(item[key] <= val.$lte)) return false;
      } else {
        if (item[key] !== val) return false;
      }
    }
    return true;
  }

  async find(query = {}) {
    const items = this._getItems().filter(item => this._matchesQuery(item, query));
    return new QueryCursor(items.map(i => ({ ...i })));
  }

  async findOne(query = {}) {
    const items = this._getItems();
    const item = items.find(it => this._matchesQuery(it, query));
    return item ? { ...item } : null;
  }

  async findById(id) {
    if (!id) return null;
    return this.findOne({ _id: id.toString() });
  }

  async create(data) {
    const items = this._getItems();
    const now = new Date().toISOString();
    const doc = {
      _id: data._id ? data._id.toString() : 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      ...data
    };
    items.push(doc);
    this.saveDatabase();
    return { ...doc };
  }

  async insertMany(docs) {
    const results = [];
    for (const d of docs) {
      results.push(await this.create(d));
    }
    return results;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const items = this._getItems();
    const index = items.findIndex(it => it._id === (id ? id.toString() : ''));
    if (index === -1) {
      if (options.upsert) {
        return this.create({ _id: id.toString(), ...updateData });
      }
      return null;
    }
    const current = items[index];
    const updated = {
      ...current,
      ...(updateData.$set ? updateData.$set : updateData),
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this.saveDatabase();
    return { ...updated };
  }

  async updateOne(query, updateData) {
    const items = this._getItems();
    const index = items.findIndex(it => this._matchesQuery(it, query));
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };
    const current = items[index];
    const updated = {
      ...current,
      ...(updateData.$set ? updateData.$set : updateData),
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this.saveDatabase();
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async updateMany(query, updateData) {
    const items = this._getItems();
    let modified = 0;
    for (let i = 0; i < items.length; i++) {
      if (this._matchesQuery(items[i], query)) {
        items[i] = {
          ...items[i],
          ...(updateData.$set ? updateData.$set : updateData),
          updatedAt: new Date().toISOString()
        };
        modified++;
      }
    }
    if (modified > 0) this.saveDatabase();
    return { matchedCount: modified, modifiedCount: modified };
  }

  async deleteOne(query) {
    const items = this._getItems();
    const index = items.findIndex(it => this._matchesQuery(it, query));
    if (index === -1) return { deletedCount: 0 };
    items.splice(index, 1);
    this.saveDatabase();
    return { deletedCount: 1 };
  }

  async deleteMany(query = {}) {
    const db = this.getDatabase();
    if (!query || Object.keys(query).length === 0) {
      const count = (db[this.name] || []).length;
      db[this.name] = [];
      this.saveDatabase();
      return { deletedCount: count };
    }
    const initial = (db[this.name] || []).length;
    db[this.name] = (db[this.name] || []).filter(it => !this._matchesQuery(it, query));
    const deleted = initial - db[this.name].length;
    this.saveDatabase();
    return { deletedCount: deleted };
  }

  async countDocuments(query = {}) {
    const items = this._getItems().filter(item => this._matchesQuery(item, query));
    return items.length;
  }
}

class QueryCursor {
  constructor(items) {
    this._items = items;
  }

  sort(sortCriteria = {}) {
    this._items.sort((a, b) => {
      for (const [key, direction] of Object.entries(sortCriteria)) {
        const valA = a[key];
        const valB = b[key];
        if (valA < valB) return direction === -1 ? 1 : -1;
        if (valA > valB) return direction === -1 ? -1 : 1;
      }
      return 0;
    });
    return this;
  }

  limit(count) {
    this._items = this._items.slice(0, count);
    return this;
  }

  skip(count) {
    this._items = this._items.slice(count);
    return this;
  }

  async exec() {
    return this._items;
  }

  then(resolve, reject) {
    return Promise.resolve(this._items).then(resolve, reject);
  }
}

class DatabaseEngine {
  constructor() {
    this.data = {};
    this.collections = {};
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {};
        this.save();
      }
    } catch (err) {
      console.warn('[DB Engine] Could not load db file, starting fresh:', err.message);
      this.data = {};
    }
    this.initialized = true;
  }

  save() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB Engine] Failed to persist data to disk:', err.message);
    }
  }

  getCollection(name) {
    this.init();
    if (!this.collections[name]) {
      this.collections[name] = new DocumentCollection(
        name,
        () => this.data,
        () => this.save()
      );
    }
    return this.collections[name];
  }

  reset() {
    this.data = {};
    this.save();
  }
}

export const dbEngine = new DatabaseEngine();
export default dbEngine;
