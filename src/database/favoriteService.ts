import {
  getDatabase,
  isNative,
  getWebData,
  setWebData,
  WEB_FAVORITES_KEY
} from '@/database/database'

export interface FavoriteArtwork {
  id: number | string
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
  created_at?: string
}

/**
 * Menambahkan artwork ke Favorite.
 */
export async function addFavorite(
  artwork: FavoriteArtwork
): Promise<void> {
  const db = await getDatabase()

  if (!db || !isNative) {
    const favorites = getWebData<FavoriteArtwork[]>(WEB_FAVORITES_KEY, [])
    const exists = favorites.some(item => String(item.id) === String(artwork.id))

    if (!exists) {
      favorites.unshift({
        ...artwork,
        created_at: new Date().toISOString()
      })
      setWebData(WEB_FAVORITES_KEY, favorites)
    }

    console.log('❤️ Artwork added to Favorites (Web):', artwork.id)
    return
  }

  await db.run(
    `
      INSERT OR IGNORE INTO favorites (
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      artwork.id,
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
    '❤️ Artwork ditambahkan ke Favorite:',
    artwork.id
  )
}

/**
 * Menghapus artwork dari Favorite.
 */
export async function removeFavorite(
  artworkId: number | string
): Promise<void> {
  const db = await getDatabase()

  if (!db || !isNative) {
    const favorites = getWebData<FavoriteArtwork[]>(WEB_FAVORITES_KEY, [])
    const updated = favorites.filter(item => String(item.id) !== String(artworkId))
    setWebData(WEB_FAVORITES_KEY, updated)

    console.log('♡ Artwork removed from Favorites (Web):', artworkId)
    return
  }

  await db.run(
    `
      DELETE FROM favorites
      WHERE artwork_id = ?
    `,
    [artworkId]
  )

  console.log(
    '♡ Artwork dihapus dari Favorite:',
    artworkId
  )
}

/**
 * Mengecek apakah artwork sudah di-Favorite.
 */
export async function isFavorite(
  artworkId: number | string
): Promise<boolean> {
  const db = await getDatabase()

  if (!db || !isNative) {
    const favorites = getWebData<FavoriteArtwork[]>(WEB_FAVORITES_KEY, [])
    return favorites.some(item => String(item.id) === String(artworkId))
  }

  const result = await db.query(
    `
      SELECT artwork_id
      FROM favorites
      WHERE artwork_id = ?
      LIMIT 1
    `,
    [artworkId]
  )

  return (result.values?.length ?? 0) > 0
}

/**
 * Mengambil semua artwork yang di-Favorite.
 */
export async function getFavorites(): Promise<
  FavoriteArtwork[]
> {
  const db = await getDatabase()

  if (!db || !isNative) {
    return getWebData<FavoriteArtwork[]>(WEB_FAVORITES_KEY, [])
  }

  const result = await db.query(
    `
      SELECT
        artwork_id AS id,
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
      FROM favorites
      ORDER BY created_at DESC
    `
  )

  return (result.values ?? []) as FavoriteArtwork[]
}

/**
 * Menghapus semua Favorite.
 */
export async function clearFavorites(): Promise<void> {
  const db = await getDatabase()

  if (!db || !isNative) {
    setWebData(WEB_FAVORITES_KEY, [])
    console.log('Favorite berhasil dikosongkan (Web)')
    return
  }

  await db.run(
    `
      DELETE FROM favorites
    `
  )

  console.log(
    'Favorite berhasil dikosongkan'
  )
}