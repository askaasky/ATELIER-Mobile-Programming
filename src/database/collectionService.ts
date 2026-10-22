import {
  getDatabase,
  isNative,
  getWebData,
  setWebData,
  WEB_COLLECTIONS_KEY,
  WEB_COLLECTION_ARTWORKS_KEY
} from '@/database/database'

export interface Collection {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface CollectionArtwork {
  id?: number | string
  artwork_id: number | string
  collection_id: number
  title?: string
  artist_display?: string
  date_display?: string
  museum?: string
  image_url?: string
  medium_display?: string
  artwork_type_title?: string
  place_of_origin?: string
  dimensions?: string
  credit_line?: string
  description?: string
}

/**
 * Membuat collection baru.
 */
export async function createCollection(
  name: string,
  description = ''
): Promise<number> {
  const db = await getDatabase()
  const cleanName = name.trim()

  if (!cleanName) {
    throw new Error(
      'Collection name cannot be empty.'
    )
  }

  if (!db || !isNative) {
    const collections = getWebData<Collection[]>(WEB_COLLECTIONS_KEY, [])
    const exists = collections.some(c => c.name.toLowerCase() === cleanName.toLowerCase())
    if (exists) {
      throw new Error('Collection name already exists.')
    }

    const newId = Date.now()
    const newCollection: Collection = {
      id: newId,
      name: cleanName,
      description: description.trim(),
      created_at: new Date().toISOString()
    }

    collections.unshift(newCollection)
    setWebData(WEB_COLLECTIONS_KEY, collections)
    console.log('📁 Collection dibuat (Web):', cleanName)
    return newId
  }

  const result = await db.run(
    `
      INSERT INTO collections (
        name,
        description,
        created_at
      )
      VALUES (?, ?, ?)
    `,
    [
      cleanName,
      description.trim(),
      new Date().toISOString()
    ]
  )

  console.log(
    '📁 Collection dibuat:',
    cleanName
  )

  return result.changes?.lastId ?? 0
}

/**
 * Mengambil semua collection milik user.
 */
export async function getCollections(): Promise<
  Collection[]
> {
  const db = await getDatabase()

  if (!db || !isNative) {
    return getWebData<Collection[]>(WEB_COLLECTIONS_KEY, [])
  }

  const result = await db.query(
    `
      SELECT
        id,
        name,
        description,
        created_at
      FROM collections
      ORDER BY created_at DESC
    `
  )

  return (result.values ?? []) as Collection[]
}

/**
 * Mengambil satu collection berdasarkan ID.
 */
export async function getCollection(
  collectionId: number
): Promise<Collection | null> {
  const db = await getDatabase()

  if (!db || !isNative) {
    const collections = getWebData<Collection[]>(WEB_COLLECTIONS_KEY, [])
    return collections.find(c => c.id === collectionId) || null
  }

  const result = await db.query(
    `
      SELECT
        id,
        name,
        description,
        created_at
      FROM collections
      WHERE id = ?
      LIMIT 1
    `,
    [collectionId]
  )

  return (
    (result.values?.[0] as Collection) ??
    null
  )
}

/**
 * Mengubah nama / deskripsi collection.
 */
export async function updateCollection(
  collectionId: number,
  name: string,
  description = ''
): Promise<void> {
  const db = await getDatabase()
  const cleanName = name.trim()

  if (!cleanName) {
    throw new Error(
      'Collection name cannot be empty.'
    )
  }

  if (!db || !isNative) {
    const collections = getWebData<Collection[]>(WEB_COLLECTIONS_KEY, [])
    const index = collections.findIndex(c => c.id === collectionId)
    if (index !== -1) {
      collections[index].name = cleanName
      collections[index].description = description.trim()
      setWebData(WEB_COLLECTIONS_KEY, collections)
    }
    return
  }

  await db.run(
    `
      UPDATE collections
      SET
        name = ?,
        description = ?
      WHERE id = ?
    `,
    [
      cleanName,
      description.trim(),
      collectionId
    ]
  )

  console.log(
    '✏️ Collection diperbarui:',
    collectionId
  )
}

/**
 * Menghapus collection.
 */
export async function deleteCollection(
  collectionId: number
): Promise<void> {
  const db = await getDatabase()

  if (!db || !isNative) {
    const collections = getWebData<Collection[]>(WEB_COLLECTIONS_KEY, [])
    setWebData(WEB_COLLECTIONS_KEY, collections.filter(c => c.id !== collectionId))

    const relation = getWebData<Array<{ id: number; collection_id: number; artwork_id: number | string; created_at: string }>>(WEB_COLLECTION_ARTWORKS_KEY, [])
    setWebData(WEB_COLLECTION_ARTWORKS_KEY, relation.filter(r => r.collection_id !== collectionId))

    console.log('🗑️ Collection dihapus (Web):', collectionId)
    return
  }

  await db.run(
    `
      DELETE FROM collection_artworks
      WHERE collection_id = ?
    `,
    [collectionId]
  )

  await db.run(
    `
      DELETE FROM collections
      WHERE id = ?
    `,
    [collectionId]
  )

  console.log(
    '🗑️ Collection dihapus:',
    collectionId
  )
}

/**
 * Menambahkan artwork ke collection.
 * Sekarang menyimpan semua metadata artwork langsung ke tabel,
 * sehingga tidak bergantung pada LEFT JOIN ke favorites.
 */
export async function addArtworkToCollection(
  collectionId: number,
  artwork: CollectionArtwork
): Promise<void> {
  const db = await getDatabase()
  const artId = String(artwork.artwork_id ?? artwork.id)

  if (!db || !isNative) {
    const relations = getWebData<Array<{
      id: number;
      collection_id: number;
      artwork_id: string;
      created_at: string;
      title?: string;
      artist_display?: string;
      date_display?: string;
      museum?: string;
      image_url?: string;
      medium_display?: string;
      artwork_type_title?: string;
      place_of_origin?: string;
      dimensions?: string;
      credit_line?: string;
      description?: string;
    }>>(WEB_COLLECTION_ARTWORKS_KEY, [])

    const exists = relations.some(r => r.collection_id === collectionId && String(r.artwork_id) === artId)

    if (!exists) {
      relations.unshift({
        id: Date.now(),
        collection_id: collectionId,
        artwork_id: artId,
        created_at: new Date().toISOString(),
        title: artwork.title,
        artist_display: artwork.artist_display,
        date_display: artwork.date_display,
        museum: artwork.museum,
        image_url: artwork.image_url,
        medium_display: artwork.medium_display,
        artwork_type_title: artwork.artwork_type_title,
        place_of_origin: artwork.place_of_origin,
        dimensions: artwork.dimensions,
        credit_line: artwork.credit_line,
        description: artwork.description
      })
      setWebData(WEB_COLLECTION_ARTWORKS_KEY, relations)
    }

    console.log('🖼️ Artwork ditambahkan ke collection (Web):', collectionId, artId)
    return
  }

  await db.run(
    `
      INSERT OR IGNORE INTO collection_artworks (
        collection_id,
        artwork_id,
        title,
        artist_display,
        date_display,
        museum,
        image_url,
        medium_display,
        artwork_type_title,
        place_of_origin,
        dimensions,
        credit_line,
        description,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      collectionId,
      artId,
      artwork.title ?? '',
      artwork.artist_display ?? '',
      artwork.date_display ?? '',
      artwork.museum ?? '',
      artwork.image_url ?? '',
      artwork.medium_display ?? '',
      artwork.artwork_type_title ?? '',
      artwork.place_of_origin ?? '',
      artwork.dimensions ?? '',
      artwork.credit_line ?? '',
      artwork.description ?? '',
      new Date().toISOString()
    ]
  )

  console.log(
    '🖼️ Artwork ditambahkan ke collection:',
    collectionId,
    artId
  )
}

/**
 * Menghapus artwork dari collection.
 */
export async function removeArtworkFromCollection(
  collectionId: number,
  artworkId: number | string
): Promise<void> {
  const db = await getDatabase()
  const artId = String(artworkId)

  if (!db || !isNative) {
    const relations = getWebData<Array<{ id: number; collection_id: number; artwork_id: number | string }>>(WEB_COLLECTION_ARTWORKS_KEY, [])
    const updated = relations.filter(r => !(r.collection_id === collectionId && String(r.artwork_id) === artId))
    setWebData(WEB_COLLECTION_ARTWORKS_KEY, updated)
    console.log('🖼️ Artwork dihapus dari collection (Web):', collectionId, artId)
    return
  }

  await db.run(
    `
      DELETE FROM collection_artworks
      WHERE collection_id = ?
      AND artwork_id = ?
    `,
    [
      collectionId,
      artId
    ]
  )

  console.log(
    '🖼️ Artwork dihapus dari collection:',
    collectionId,
    artId
  )
}

/**
 * Mengecek apakah artwork ada di collection tertentu.
 */
export async function isArtworkInCollection(
  collectionId: number,
  artworkId: number | string
): Promise<boolean> {
  const db = await getDatabase()
  const artId = String(artworkId)

  if (!db || !isNative) {
    const relations = getWebData<Array<{ collection_id: number; artwork_id: number | string }>>(WEB_COLLECTION_ARTWORKS_KEY, [])
    return relations.some(r => r.collection_id === collectionId && String(r.artwork_id) === artId)
  }

  const result = await db.query(
    `
      SELECT id
      FROM collection_artworks
      WHERE collection_id = ?
      AND artwork_id = ?
      LIMIT 1
    `,
    [
      collectionId,
      artId
    ]
  )

  return (result.values?.length ?? 0) > 0
}

/**
 * Mengambil semua artwork dalam sebuah collection.
 * Sekarang langsung baca dari tabel collection_artworks
 * tanpa bergantung pada LEFT JOIN ke favorites.
 */
export async function getCollectionArtworks(
  collectionId: number
): Promise<CollectionArtwork[]> {
  const db = await getDatabase()

  if (!db || !isNative) {
    const relations = getWebData<any[]>(WEB_COLLECTION_ARTWORKS_KEY, [])
    const filtered = relations.filter(r => r.collection_id === collectionId)

    return filtered.map(r => ({
      id: r.id,
      artwork_id: r.artwork_id,
      collection_id: r.collection_id,
      title: r.title,
      artist_display: r.artist_display,
      date_display: r.date_display,
      museum: r.museum,
      image_url: r.image_url,
      medium_display: r.medium_display,
      artwork_type_title: r.artwork_type_title,
      place_of_origin: r.place_of_origin,
      dimensions: r.dimensions,
      credit_line: r.credit_line,
      description: r.description
    }))
  }

  const result = await db.query(
    `
      SELECT
        id,
        artwork_id,
        collection_id,
        title,
        artist_display,
        date_display,
        museum,
        image_url,
        medium_display,
        artwork_type_title,
        place_of_origin,
        dimensions,
        credit_line,
        description
      FROM collection_artworks
      WHERE collection_id = ?
      ORDER BY created_at DESC
    `,
    [collectionId]
  )

  return (result.values ?? []) as CollectionArtwork[]
}

/**
 * Mengambil semua collection yang memiliki artwork tertentu.
 */
export async function getCollectionsForArtwork(
  artworkId: number | string
): Promise<Collection[]> {
  const db = await getDatabase()
  const artId = String(artworkId)

  if (!db || !isNative) {
    const relations = getWebData<Array<{ collection_id: number; artwork_id: number | string }>>(WEB_COLLECTION_ARTWORKS_KEY, [])
    const matchingCollectionIds = new Set(relations.filter(r => String(r.artwork_id) === artId).map(r => r.collection_id))
    const collections = getWebData<Collection[]>(WEB_COLLECTIONS_KEY, [])

    return collections.filter(c => matchingCollectionIds.has(c.id))
  }

  const result = await db.query(
    `
      SELECT
        c.id,
        c.name,
        c.description,
        c.created_at

      FROM collections c

      INNER JOIN collection_artworks ca
        ON ca.collection_id = c.id

      WHERE ca.artwork_id = ?

      ORDER BY c.created_at DESC
    `,
    [artId]
  )

  return (result.values ?? []) as Collection[]
}