/*
|--------------------------------------------------------------------------
| ART API SERVICE — Metropolitan Museum of Art (Met) + Cleveland Museum of Art (CMA)
| Dual API Integration with Search Relevance Scoring & Fallback Artworks
|--------------------------------------------------------------------------
*/

export interface Artwork {
  id: number | string
  title: string
  artist_display: string
  artist_bio?: string
  date_display: string
  image_url: string
  fallback_image: string
  museum: string
  medium_display: string
  dimensions: string
  credit_line: string
  place_of_origin: string
  description?: string
  tags?: string[]
  _source?: 'met' | 'cleveland'
}

/*
|--------------------------------------------------------------------------
| HELPER TO BUILD STRUCTURED MULTI-LINE DESCRIPTION FROM MET METADATA
|--------------------------------------------------------------------------
*/

export function buildMetDescription(item: {
  artistDisplayBio?: string
  medium?: string
  dimensions?: string
  creditLine?: string
  repository?: string
  tags?: any[]
}): string {
  const parts: string[] = []

  if (item.artistDisplayBio) {
    parts.push(`Artist Bio: ${item.artistDisplayBio}`)
  }
  if (item.medium) {
    parts.push(`Medium: ${item.medium}`)
  }
  if (item.dimensions) {
    parts.push(`Dimensions: ${item.dimensions}`)
  }
  if (item.creditLine) {
    parts.push(`Collection: ${item.creditLine}`)
  }
  if (item.repository) {
    parts.push(`Museum: ${item.repository}`)
  }
  if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
    const tagNames = item.tags
      .map((t: any) => (typeof t === 'string' ? t : t?.term))
      .filter(Boolean)
      .join(', ')
    if (tagNames) {
      parts.push(`Tags: ${tagNames}`)
    }
  }

  return parts.join('\n')
}

/*
|--------------------------------------------------------------------------
| HARDCODED MET MASTERPIECES (Fallback)
|--------------------------------------------------------------------------
*/

export const FALLBACK_ARTWORKS: Artwork[] = [
  {
    id: 436535,
    title: 'Wheat Field with Cypresses',
    artist_display: 'Vincent van Gogh (Dutch, 1853–1890)',
    artist_bio: 'Dutch Post-Impressionist painter who became one of the most famous figures in Western art history.',
    date_display: '1889',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP130999.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP130999.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on canvas',
    dimensions: '73.2 x 93.4 cm',
    credit_line: 'Purchase, The Annenberg Foundation Gift, 1993',
    place_of_origin: 'Saint-Rémy-de-Provence, France',
    description: `Wheat Field with Cypresses depicts a view of the wheat fields in Saint-Rémy. Van Gogh was fascinated by the cypress trees, which towered like Egyptian obelisks.
Artist Bio: Vincent van Gogh (Dutch, 1853–1890)
Medium: Oil on canvas
Dimensions: 73.2 x 93.4 cm
Collection: Purchase, The Annenberg Foundation Gift, 1993
Museum: The Metropolitan Museum of Art
Tags: Landscape, Post-Impressionism, Trees`,
    tags: ['Landscape', 'Post-Impressionism', 'Trees']
  },
  {
    id: 436524,
    title: 'Self-Portrait with a Straw Hat',
    artist_display: 'Vincent van Gogh (Dutch, 1853–1890)',
    artist_bio: 'Dutch Post-Impressionist painter.',
    date_display: '1887',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP254727.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP254727.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on canvas',
    dimensions: '40.6 x 31.8 cm',
    credit_line: 'Bequest of Joseph H. Hazen, 1994',
    place_of_origin: 'Paris, France',
    description: `Van Gogh's self-portrait wearing a straw hat, rendered in bright colors characteristic of his Paris period.
Artist Bio: Vincent van Gogh (Dutch, 1853–1890)
Medium: Oil on canvas
Dimensions: 40.6 x 31.8 cm
Collection: Bequest of Joseph H. Hazen, 1994
Museum: The Metropolitan Museum of Art
Tags: Portrait, Self-portrait, Post-Impressionism`,
    tags: ['Portrait', 'Self-portrait', 'Post-Impressionism']
  },
  {
    id: 437980,
    title: 'The Water Lily Pond',
    artist_display: 'Claude Monet (French, 1840–1926)',
    artist_bio: 'French painter and founder of Impressionist painting.',
    date_display: '1899',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-25466-001.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-25466-001.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on canvas',
    dimensions: '93 x 74 cm',
    credit_line: 'H. O. Havemeyer Collection, Bequest of Mrs. H. O. Havemeyer, 1929',
    place_of_origin: 'Giverny, France',
    description: `A painting of the water lily pond with the Japanese-style footbridge created by Monet in Giverny.
Artist Bio: Claude Monet (French, 1840–1926)
Medium: Oil on canvas
Dimensions: 93 x 74 cm
Collection: H. O. Havemeyer Collection, 1929
Museum: The Metropolitan Museum of Art
Tags: Water Lilies, Impressionism, Nature`,
    tags: ['Water Lilies', 'Impressionism', 'Nature']
  },
  {
    id: 436532,
    title: 'Madame X (Madame Pierre Gautreau)',
    artist_display: 'John Singer Sargent (American, 1856–1925)',
    artist_bio: 'American expatriate artist, considered the leading portrait painter of his generation.',
    date_display: '1883–84',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP121287.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP121287.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on canvas',
    dimensions: '208.6 x 109.9 cm',
    credit_line: 'Arthur Hoppock Hearn Fund, 1916',
    place_of_origin: 'Paris, France',
    description: `An iconic portrait of Madame Virginie Avegno Gautreau that once provoked scandal at the 1884 Paris Salon.
Artist Bio: John Singer Sargent (American, 1856–1925)
Medium: Oil on canvas
Dimensions: 208.6 x 109.9 cm
Collection: Arthur Hoppock Hearn Fund, 1916
Museum: The Metropolitan Museum of Art
Tags: Portrait, Realism, Oil painting`,
    tags: ['Portrait', 'Realism', 'Oil painting']
  },
  {
    id: 437326,
    title: 'The Death of Socrates',
    artist_display: 'Jacques Louis David (French, 1748–1825)',
    artist_bio: 'Neoclassical French painter.',
    date_display: '1787',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-13139-001.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-13139-001.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on canvas',
    dimensions: '129.5 x 196.2 cm',
    credit_line: 'Catharine Lorillard Wolfe Collection, Wolfe Fund, 1931',
    place_of_origin: 'Paris, France',
    description: `A Neoclassical masterpiece depicting the execution of Greek philosopher Socrates by drinking hemlock.
Artist Bio: Jacques Louis David (French, 1748–1825)
Medium: Oil on canvas
Dimensions: 129.5 x 196.2 cm
Collection: Catharine Lorillard Wolfe Collection, Wolfe Fund, 1931
Museum: The Metropolitan Museum of Art
Tags: History, Neoclassicism, Socrates`,
    tags: ['History', 'Neoclassicism', 'Socrates']
  },
  {
    id: 436105,
    title: 'The Denial of Saint Peter',
    artist_display: 'Caravaggio (Michelangelo Merisi) (Italian, 1571–1610)',
    artist_bio: 'Italian painter whose work exercised a formative influence on Baroque painting.',
    date_display: '1610',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP140718.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP140718.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on canvas',
    dimensions: '94 x 125.4 cm',
    credit_line: 'Gift of Herman and Sugar Pfeifer, 1997',
    place_of_origin: 'Rome, Italy',
    description: `A dramatic Chiaroscuro painting depicting Saint Peter's denial before the rooster crows.
Artist Bio: Caravaggio (Italian, 1571–1610)
Medium: Oil on canvas
Dimensions: 94 x 125.4 cm
Collection: Gift of Herman and Sugar Pfeifer, 1997
Museum: The Metropolitan Museum of Art
Tags: Religious, Baroque, Chiaroscuro`,
    tags: ['Religious', 'Baroque', 'Chiaroscuro']
  },
  {
    id: 435882,
    title: 'The Harvesters',
    artist_display: 'Pieter Bruegel the Elder (Netherlandish, ca. 1525–1569)',
    artist_bio: 'Dutch and Flemish Renaissance painter.',
    date_display: '1565',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-19453-001.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-19453-001.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on wood',
    dimensions: '119 x 162 cm',
    credit_line: 'Rogers Fund, 1919',
    place_of_origin: 'Antwerp, Belgium',
    description: `A depiction of a summer landscape and peasants harvesting wheat.
Artist Bio: Pieter Bruegel the Elder (Netherlandish, ca. 1525–1569)
Medium: Oil on wood
Dimensions: 119 x 162 cm
Collection: Rogers Fund, 1919
Museum: The Metropolitan Museum of Art
Tags: Renaissance, Landscape, Rural life`,
    tags: ['Renaissance', 'Landscape', 'Rural life']
  },
  {
    id: 436838,
    title: 'The Sleeping Gypsy',
    artist_display: 'Henri Rousseau (French, 1844–1910)',
    artist_bio: 'French Naive artist.',
    date_display: '1897',
    image_url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP245995.jpg',
    fallback_image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP245995.jpg',
    museum: 'The Metropolitan Museum of Art',
    medium_display: 'Oil on canvas',
    dimensions: '110 x 200.7 cm',
    credit_line: 'Gift of Mrs. Simon Guggenheim, 1939',
    place_of_origin: 'Paris, France',
    description: `A surrealist painting of a sleeping gypsy in the desert under moonlight, watched over by a lion.
Artist Bio: Henri Rousseau (French, 1844–1910)
Medium: Oil on canvas
Dimensions: 110 x 200.7 cm
Collection: Gift of Mrs. Simon Guggenheim, 1939
Museum: The Metropolitan Museum of Art
Tags: Naive Art, Surrealism, Night`,
    tags: ['Naive Art', 'Surrealism', 'Night']
  }
]

/*
|--------------------------------------------------------------------------
| UTILITIES
|--------------------------------------------------------------------------
*/

export function rotateDaily(list: Artwork[]): Artwork[] {
  if (!list || list.length === 0) return []
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const shift = dayOfYear % list.length
  return [...list.slice(shift), ...list.slice(0, shift)]
}

function deduplicateById(artworks: Artwork[]): Artwork[] {
  const seen = new Set<string | number>()
  return artworks.filter(item => {
    if (!item.id) return false
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

/*
|--------------------------------------------------------------------------
| RELEVANCE SCORING FOR SEARCH RESULTS
| Fixes search inaccuracy by scoring artwork relevance against the query
|--------------------------------------------------------------------------
*/

function scoreRelevance(art: Artwork, query: string): number {
  if (!query || !query.trim()) return 0

  const q = query.trim().toLowerCase()
  const words = q.split(/\s+/).filter(w => w.length > 1)

  const title = (art.title || '').toLowerCase()
  const artist = (art.artist_display || '').toLowerCase()
  const tags = (art.tags || []).join(' ').toLowerCase()
  const origin = (art.place_of_origin || '').toLowerCase()
  const medium = (art.medium_display || '').toLowerCase()
  const desc = (art.description || '').toLowerCase()

  let score = 0

  // 1. Exact Title Match
  if (title === q) score += 100
  else if (title.startsWith(q)) score += 60
  else if (title.includes(q)) score += 40

  // Title word matches
  words.forEach(w => {
    if (title.includes(w)) score += 15
  })

  // 2. Artist Match
  if (artist.includes(q)) score += 35
  words.forEach(w => {
    if (artist.includes(w)) score += 10
  })

  // 3. Tags Match
  if (tags.includes(q)) score += 20
  words.forEach(w => {
    if (tags.includes(w)) score += 8
  })

  // 4. Place / Medium Match
  if (origin.includes(q)) score += 10
  if (medium.includes(q)) score += 10

  // 5. Description Match
  words.forEach(w => {
    if (desc.includes(w)) score += 2
  })

  // Has image bonus
  if (art.image_url && !art.image_url.includes('placeholder')) {
    score += 5
  }

  return score
}

/*
|--------------------------------------------------------------------------
| API 1: THE METROPOLITAN MUSEUM OF ART (MET) API INTEGRATION
|--------------------------------------------------------------------------
*/

export async function fetchMetArtworksByIDs(ids: number[]): Promise<Artwork[]> {
  const promises = ids.map(async id => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      if (!res.ok) return null
      const data = await res.json()

      const imageUrl = data.primaryImageSmall || data.primaryImage
      if (!imageUrl) return null

      const tagsList =
        data.tags && Array.isArray(data.tags)
          ? data.tags.map((t: any) => t.term).filter(Boolean)
          : []

      const desc = buildMetDescription({
        artistDisplayBio: data.artistDisplayBio || data.artistNationality,
        medium: data.medium,
        dimensions: data.dimensions,
        creditLine: data.creditLine,
        repository: data.repository || 'The Metropolitan Museum of Art',
        tags: data.tags
      })

      const artwork: Artwork = {
        id: data.objectID,
        title: data.title || 'Untitled',
        artist_display:
          data.artistDisplayName || data.culture || 'Unknown Artist',
        artist_bio: data.artistDisplayBio || '',
        date_display: data.objectDate || 'Unknown Date',
        image_url: imageUrl,
        fallback_image: imageUrl,
        museum: data.repository || 'The Metropolitan Museum of Art',
        medium_display: data.medium || 'Unspecified Medium',
        dimensions: data.dimensions || 'Dimensions Unavailable',
        credit_line: data.creditLine || '',
        place_of_origin:
          data.city || data.country || data.geographyType || 'Unknown Origin',
        description: desc,
        tags: tagsList,
        _source: 'met'
      }

      return artwork
    } catch {
      return null
    }
  })

  const results = await Promise.all(promises)
  return results.filter((item): item is Artwork => item !== null)
}

async function searchMetArtworks(query: string, limit: number = 20): Promise<Artwork[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(
      query
    )}`

    const res = await fetch(searchUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) return []
    const data = await res.json()

    if (!data.objectIDs || data.objectIDs.length === 0) return []

    // Fetch top candidates from Met
    const targetIDs = data.objectIDs.slice(0, Math.min(limit * 2, 40))
    return await fetchMetArtworksByIDs(targetIDs)
  } catch {
    return []
  }
}

/*
|--------------------------------------------------------------------------
| API 2: CLEVELAND MUSEUM OF ART (CMA) API INTEGRATION
| Open Access API - https://openaccess-api.clevelandart.org/api/artworks/
|--------------------------------------------------------------------------
*/

function mapClevelandItem(item: any): Artwork | null {
  try {
    if (!item) return null

    // Get image URL (web size preferred)
    const webImg = item.images?.web?.url
    const printImg = item.images?.print?.url
    const fullImg = item.images?.full?.url
    const imageUrl = webImg || printImg || fullImg

    if (!imageUrl) return null

    // Extract creator / artist
    let artistName = 'Unknown Artist'
    let artistBio = ''
    if (item.creators && Array.isArray(item.creators) && item.creators.length > 0) {
      const creator = item.creators[0]
      artistName = creator.description || creator.biography || 'Unknown Artist'
      artistBio = creator.biography || ''
    } else if (item.culture && item.culture.length > 0) {
      artistName = item.culture.join(', ')
    }

    // Tags / Classification
    const tags: string[] = []
    if (item.type) tags.push(item.type)
    if (item.department) tags.push(item.department)
    if (item.classification_type) tags.push(item.classification_type)
    if (item.culture && Array.isArray(item.culture)) {
      tags.push(...item.culture)
    }

    // Build structured description
    // Main artwork info (did_you_know + description combined)
    const mainText: string[] = []
    if (item.did_you_know) mainText.push(item.did_you_know)
    if (item.description) mainText.push(item.description)

    // Labeled metadata sections
    const metaParts: string[] = []
    if (artistBio) metaParts.push(`Artist Bio:\n${artistBio}`)
    if (item.technique) metaParts.push(`Technique:\n${item.technique}`)
    if (item.measurements) metaParts.push(`Dimensions:\n${item.measurements}`)
    if (item.creditline) metaParts.push(`Collection:\n${item.creditline}`)
    metaParts.push('Museum:\nCleveland Museum of Art')

    // Join: main text block + blank line + each meta section separated by blank line
    const allParts: string[] = []
    if (mainText.length > 0) allParts.push(mainText.join(' '))
    allParts.push(...metaParts)
    const descriptionText = allParts.join('\n\n')

    const artwork: Artwork = {
      id: `cma-${item.id}`,
      title: item.title || 'Untitled',
      artist_display: artistName,
      artist_bio: artistBio,
      date_display: item.creation_date || item.date_text || 'Unknown Date',
      image_url: imageUrl,
      fallback_image: imageUrl,
      museum: 'Cleveland Museum of Art',
      medium_display: item.technique || item.type || 'Unspecified Medium',
      dimensions: item.measurements || 'Dimensions Unavailable',
      credit_line: item.creditline || '',
      place_of_origin:
        item.culture && item.culture.length > 0
          ? item.culture.join(', ')
          : 'Cleveland Museum of Art',
      description: descriptionText,
      tags: tags,
      _source: 'cleveland'
    }

    return artwork
  } catch {
    return null
  }
}

async function fetchClevelandArtworks(query: string = '', limit: number = 20): Promise<Artwork[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const qParam = query ? `&q=${encodeURIComponent(query)}` : ''
    const url = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=${limit}${qParam}`

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) return []
    const json = await res.json()

    if (!json.data || !Array.isArray(json.data)) return []

    const mapped = json.data
      .map((item: any) => mapClevelandItem(item))
      .filter((art: Artwork | null): art is Artwork => art !== null)

    return mapped
  } catch {
    return []
  }
}

/*
|--------------------------------------------------------------------------
| COMBINED FETCHERS
| Fetch from BOTH Met and Cleveland APIs in parallel
|--------------------------------------------------------------------------
*/

export async function getArtworks(): Promise<{ data: Artwork[] }> {
  const curatorMetIDs = [
    436535, 436524, 437980, 436532, 437326, 436105, 435882, 436838,
    436530, 437052, 437984, 435809, 436543, 436526, 436121, 436533
  ]

  try {
    const [metResult, cmaResult] = await Promise.allSettled([
      fetchMetArtworksByIDs(curatorMetIDs),
      fetchClevelandArtworks('', 15)
    ])

    const metArtworks = metResult.status === 'fulfilled' ? metResult.value : []
    const cmaArtworks = cmaResult.status === 'fulfilled' ? cmaResult.value : []

    // Interleave Met and CMA results for variety
    const combined: Artwork[] = []
    const maxLen = Math.max(metArtworks.length, cmaArtworks.length)

    for (let i = 0; i < maxLen; i++) {
      if (i < metArtworks.length) combined.push(metArtworks[i])
      if (i < cmaArtworks.length) combined.push(cmaArtworks[i])
    }

    const unique = deduplicateById(combined)
    return { data: unique.length > 0 ? unique : FALLBACK_ARTWORKS }
  } catch {
    return { data: FALLBACK_ARTWORKS }
  }
}

export async function getDailyExploreArtworks(
  count: number = 20,
  excludeIds: (number | string)[] = []
): Promise<Artwork[]> {
  const exploreMetIDs = [
    436535, 436524, 437980, 436532, 437326, 436105, 435882, 436838,
    436530, 437052, 437984, 435809, 436543, 436526, 436121, 436533,
    436529, 436527, 437981, 436534
  ]

  try {
    const [metResult, cmaResult] = await Promise.allSettled([
      fetchMetArtworksByIDs(exploreMetIDs),
      fetchClevelandArtworks('painting', 15)
    ])

    const metArtworks = metResult.status === 'fulfilled' ? metResult.value : []
    const cmaArtworks = cmaResult.status === 'fulfilled' ? cmaResult.value : []

    const excludeSet = new Set(excludeIds.map(String))
    const combined = [...metArtworks, ...cmaArtworks].filter(
      art => !excludeSet.has(String(art.id))
    )

    const unique = deduplicateById(rotateDaily(combined))

    if (unique.length < count) {
      const remainingFallback = FALLBACK_ARTWORKS.filter(
        art => !excludeSet.has(String(art.id))
      )
      return deduplicateById([...unique, ...remainingFallback]).slice(0, count)
    }

    return unique.slice(0, count)
  } catch {
    return FALLBACK_ARTWORKS
  }
}

/*
|--------------------------------------------------------------------------
| SEARCH FUNCTIONALITY
| Searches across BOTH Met API and Cleveland Museum API in parallel.
| Scores and sorts results by search relevance to ensure accurate results.
|--------------------------------------------------------------------------
*/

export async function searchArtworks(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: Artwork[]; artworks: Artwork[]; totalPages: number }> {
  if (!query || !query.trim()) {
    const res = await getArtworks()
    const all = res.data
    const paginated = all.slice((page - 1) * limit, page * limit)
    return {
      data: paginated,
      artworks: paginated,
      totalPages: Math.ceil(all.length / limit) || 1
    }
  }

  const cleanQuery = query.trim()

  try {
    // 1. Fetch from Met and Cleveland in parallel
    const [metResult, cmaResult] = await Promise.allSettled([
      searchMetArtworks(cleanQuery, limit * 2),
      fetchClevelandArtworks(cleanQuery, limit * 2)
    ])

    const metArtworks = metResult.status === 'fulfilled' ? metResult.value : []
    const cmaArtworks = cmaResult.status === 'fulfilled' ? cmaResult.value : []

    const combined = deduplicateById([...metArtworks, ...cmaArtworks])

    // 2. Score each result for search relevance
    const scored = combined.map(art => ({
      art,
      score: scoreRelevance(art, cleanQuery)
    }))

    // 3. Filter out results with 0 score (completely irrelevant) if we have better matches
    let matches = scored.filter(item => item.score > 0)

    // Fall back to all returned if no scored matches
    if (matches.length === 0) {
      matches = scored
    }

    // 4. Sort descending by relevance score
    matches.sort((a, b) => b.score - a.score)

    const sortedArtworks = matches.map(m => m.art)

    // 5. Pagination
    const startIndex = (page - 1) * limit
    const paginated = sortedArtworks.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(sortedArtworks.length / limit) || 1

    return {
      data: paginated,
      artworks: paginated,
      totalPages
    }
  } catch {
    // Fallback search against hardcoded artworks if network fails
    const filteredFallback = FALLBACK_ARTWORKS.filter(art => {
      const q = cleanQuery.toLowerCase()
      return (
        art.title.toLowerCase().includes(q) ||
        art.artist_display.toLowerCase().includes(q) ||
        (art.tags && art.tags.some(t => t.toLowerCase().includes(q)))
      )
    })

    return {
      data: filteredFallback,
      artworks: filteredFallback,
      totalPages: 1
    }
  }
}
