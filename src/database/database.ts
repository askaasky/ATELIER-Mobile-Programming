import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'

let sqlite: SQLiteConnection | null = null
let db: SQLiteDBConnection | null = null

const DB_NAME = 'atelier'
const isNative = Capacitor.isNativePlatform()

// In-memory / LocalStorage fallback data structures for Web
const WEB_FAVORITES_KEY = 'atelier_web_favorites'
const WEB_COLLECTIONS_KEY = 'atelier_web_collections'
const WEB_COLLECTION_ARTWORKS_KEY = 'atelier_web_collection_artworks'

function getWebData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function setWebData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Failed to save to localStorage:', err)
  }
}

/**
 * Membuka database Atelier.
 */
export async function initDatabase(): Promise<SQLiteDBConnection | null> {
  if (!isNative) {
    console.log('SQLite Atelier (Web Fallback active)')
    return null
  }

  if (db) {
    return db
  }

  try {
    if (!Capacitor.isPluginAvailable('CapacitorSQLite')) {
      console.warn('CapacitorSQLite plugin is not available. Falling back to Web storage.')
      return null
    }

    if (!sqlite) {
      sqlite = new SQLiteConnection(CapacitorSQLite)
    }

    const retDict = await sqlite.checkConnectionsConsistency()
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result

    let connection: SQLiteDBConnection
    if (retDict.result && isConn) {
      connection = await sqlite.retrieveConnection(DB_NAME, false)
    } else {
      connection = await sqlite.createConnection(
        DB_NAME,
        false,
        'no-encryption',
        1,
        false
      )
    }

    db = connection

    await db.open()

    await createTables()

    console.log('SQLite Atelier siap')

    return db
  } catch (error) {
    console.warn(
      'Gagal membuka database Atelier (Falling back to Web storage):',
      error
    )

    db = null
    return null
  }
}

/**
 * Membuat seluruh tabel database Atelier.
 */
async function createTables(): Promise<void> {
  if (!db) {
    throw new Error('Database belum dibuka.')
  }

  const sql = `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artwork_id TEXT NOT NULL UNIQUE,

      title TEXT,
      artist_display TEXT,
      date_display TEXT,
      museum TEXT,
      image_url TEXT,
      medium_display TEXT,
      artwork_type_title TEXT,
      place_of_origin TEXT,
      dimensions TEXT,
      credit_line TEXT,
      description TEXT,

      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      name TEXT NOT NULL UNIQUE,
      description TEXT,

      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collection_artworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      collection_id INTEGER NOT NULL,
      artwork_id TEXT NOT NULL,

      title TEXT,
      artist_display TEXT,
      date_display TEXT,
      museum TEXT,
      image_url TEXT,
      medium_display TEXT,
      artwork_type_title TEXT,
      place_of_origin TEXT,
      dimensions TEXT,
      credit_line TEXT,
      description TEXT,

      created_at TEXT NOT NULL,

      UNIQUE (
        collection_id,
        artwork_id
      ),

      FOREIGN KEY (
        collection_id
      )
      REFERENCES collections(id)
      ON DELETE CASCADE
    );
  `

  await db.execute(sql)

  console.log(
    '✅ Tabel Atelier berhasil dibuat'
  )
}

/**
 * Mengambil database yang sedang aktif.
 * Kalau belum ada, otomatis melakukan init.
 */
export async function getDatabase(): Promise<SQLiteDBConnection | null> {
  if (!isNative) {
    return null
  }

  if (!db) {
    return await initDatabase()
  }

  return db
}

/**
 * Menutup koneksi database.
 */
export async function closeDatabase(): Promise<void> {
  if (!db || !sqlite) {
    return
  }

  try {
    await db.close()

    await sqlite.closeConnection(
      DB_NAME,
      false
    )

    db = null

    console.log(
      'SQLite Atelier ditutup'
    )
  } catch (error) {
    console.error(
      'Gagal menutup SQLite Atelier:',
      error
    )
  }
}

export { isNative, getWebData, setWebData, WEB_FAVORITES_KEY, WEB_COLLECTIONS_KEY, WEB_COLLECTION_ARTWORKS_KEY }