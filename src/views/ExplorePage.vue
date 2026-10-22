<template>
  <ion-page style="--background: #151f2e; background: #151f2e;">
    <ion-content :fullscreen="true" style="--background: #151f2e; --ion-background-color: #151f2e;">
      <div class="explore-page">

        <!-- HEADER -->
        <header class="explore-header">
          <button
            class="back-button"
            @click="goBack"
            title="Back"
          >
            ←
          </button>

          <div class="header-title">
            <span class="brand-small">ATELIER</span>
            <h1>Explore Art</h1>
          </div>
        </header>

        <!-- SEARCH -->
        <section class="explore-search-container">
          <div class="explore-search-box">
            <span
              class="search-icon"
              @click="performSearch"
            >
              ⌕
            </span>

            <input
              v-model="searchInput"
              type="text"
              placeholder="Search artwork, artist, or style..."
              @keyup.enter="performSearch"
            />

            <button
              v-if="searchInput"
              class="clear-search-btn"
              @click="clearSearch"
              aria-label="Clear search"
            >
              ×
            </button>
          </div>
        </section>

        <!-- RESULT INFO -->
        <main class="explore-content">
          <section class="search-result-header">
            <p class="result-label">
              {{ searchQuery ? 'SEARCH RESULTS' : 'EXPLORATION COLLECTION' }}
            </p>

            <h2>
              {{ searchQuery ? `"${searchQuery}"` : 'All Artworks' }}
            </h2>

            <p class="result-count">
              {{ artworks.length }} artworks found
            </p>
          </section>

          <!-- LOADING -->
          <div
            v-if="loading"
            class="loading-state"
          >
            <div class="loading-spinner"></div>
            <p>Searching artworks...</p>
          </div>

          <!-- ERROR -->
          <div
            v-else-if="errorMessage"
            class="error-state"
          >
            <p>{{ errorMessage }}</p>

            <button
              class="retry-button"
              @click="loadSearchResults"
            >
              Retry
            </button>
          </div>

          <!-- EMPTY -->
          <div
            v-else-if="artworks.length === 0"
            class="empty-state"
          >
            <div class="empty-icon">◌</div>

            <h3>No artwork found</h3>

            <p>
              {{
                searchQuery
                  ? `No artwork matched "${searchQuery}".`
                  : 'No artworks available yet.'
              }}
            </p>
          </div>

          <!-- RESULTS -->
          <section
            v-else
            class="explore-artwork-grid"
          >
            <article
              v-for="(art, index) in artworks"
              :key="art.id"
              class="explore-art-card"
              @click="openArtworkDetail(art)"
            >
              <div class="explore-art-image">
                <img
                  :src="getArtworkSrc(art)"
                  :alt="art.title || 'Artwork'"
                  :loading="index < 4 ? 'eager' : 'lazy'"
                  decoding="async"
                  @error="handleImageError($event, art)"
                />

                <button
                  class="favorite-button"
                  :class="{ liked: isLiked(art.id) }"
                  @click.stop="toggleLike(art.id)"
                  :title="isLiked(art.id) ? 'Remove Favorite' : 'Favorite Artwork'"
                >
                  {{ isLiked(art.id) ? '♥' : '♡' }}
                </button>
              </div>

              <div class="explore-art-info">
                <h3 class="art-title">
                  {{ art.title || 'Untitled' }}
                </h3>

                <p class="art-artist">
                  {{ art.artist_display || 'Unknown Artist' }}
                </p>

                <p class="art-year">
                  {{ cleanDate(art.date_display) }}
                </p>

                <p
                  v-if="art.museum"
                  class="art-museum"
                >
                  ♜&nbsp;{{ art.museum }}
                </p>
              </div>
            </article>
          </section>
        </main>
      </div>
    </ion-content>

    <!-- DETAIL MODAL -->
    <teleport to="body">
      <div
        v-if="selectedArtwork"
        class="artwork-modal-overlay"
        @click.self="closeArtworkDetail"
      >
        <div class="artwork-modal-card">

          <button
            class="modal-close-btn"
            @click="closeArtworkDetail"
            aria-label="Close"
          >
            ×
          </button>

          <div class="modal-img-full">
            <img
              :src="getArtworkSrc(selectedArtwork)"
              :alt="selectedArtwork.title || 'Artwork'"
              @error="handleImageError($event, selectedArtwork)"
            />
          </div>

          <div class="modal-body">

            <div class="modal-title-block">
              <h2 class="modal-title">
                {{ selectedArtwork.title || 'Untitled' }}
              </h2>

              <p class="modal-artist-name">
                {{ selectedArtwork.artist_display || 'Unknown Artist' }}
              </p>
            </div>

            <p class="modal-museum-tag">
              <span class="modal-museum-icon">♜</span>
              {{ selectedArtwork.museum || 'Art Institute of Chicago' }}
            </p>

            <div class="modal-meta">
              <span
                v-if="selectedArtwork.date_display"
                class="modal-meta-item"
              >
                {{ cleanDate(selectedArtwork.date_display) }}
              </span>

              <span
                v-if="selectedArtwork.medium_display"
                class="modal-meta-item"
              >
                {{ selectedArtwork.medium_display }}
              </span>

              <span
                v-if="selectedArtwork.artwork_type_title"
                class="modal-meta-item"
              >
                {{ selectedArtwork.artwork_type_title }}
              </span>
            </div>

            <div class="modal-divider"></div>

            <div class="modal-desc-block">
              <p class="modal-desc-label">
                About Artwork
              </p>

              <div
                v-if="getArtworkDescription(selectedArtwork)"
                class="modal-desc-text"
              >
                <template
                  v-for="(section, idx) in getDescriptionSections(selectedArtwork)"
                  :key="idx"
                >
                  <p
                    v-if="section.label"
                    class="modal-desc-section-label"
                  >{{ section.label }}</p>
                  <p class="modal-desc-section-value">{{ section.value }}</p>
                </template>
              </div>

              <p
                v-else
                class="modal-desc-empty"
              >
                No description available for this artwork in the museum collection data.
              </p>
            </div>

            <div
              v-if="
                selectedArtwork.place_of_origin ||
                selectedArtwork.dimensions ||
                selectedArtwork.credit_line
              "
              class="modal-extra-info"
            >
              <div
                v-if="selectedArtwork.place_of_origin"
                class="extra-info-row"
              >
                <span class="extra-info-label">Origin</span>
                <span class="extra-info-value">
                  {{ selectedArtwork.place_of_origin }}
                </span>
              </div>

              <div
                v-if="selectedArtwork.dimensions"
                class="extra-info-row"
              >
                <span class="extra-info-label">Dimensions</span>
                <span class="extra-info-value">
                  {{ selectedArtwork.dimensions }}
                </span>
              </div>

              <div
                v-if="selectedArtwork.credit_line"
                class="extra-info-row"
              >
                <span class="extra-info-label">Collection</span>
                <span class="extra-info-value">
                  {{ selectedArtwork.credit_line }}
                </span>
              </div>
            </div>

            <!-- ACTION BUTTONS (FAVORITE & COLLECTION) -->
            <div class="modal-actions-row">
              <button
                class="modal-fav-btn"
                :class="{
                  liked: isLiked(selectedArtwork.id)
                }"
                @click="toggleLike(selectedArtwork.id)"
              >
                <span class="modal-fav-icon">
                  {{ isLiked(selectedArtwork.id) ? '♥' : '♡' }}
                </span>
                <span>
                  {{
                    isLiked(selectedArtwork.id)
                      ? 'Favorite'
                      : 'Add to Favorite'
                  }}
                </span>
              </button>

              <button
                class="modal-coll-btn"
                @click="openCollectionSelector(selectedArtwork)"
              >
                <span class="modal-coll-icon">♧</span>
                <span>Add to Collection</span>
              </button>
            </div>
            
            <button
              class="modal-chat-btn"
              @click="openChat(selectedArtwork)"
            >
              <span class="modal-chat-icon">✦</span>
              <span>Ask AI about this artwork</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- SELECT COLLECTION MODAL -->
    <teleport to="body">
      <div
        v-if="showCollectionSelector"
        class="collection-modal-overlay"
        @click.self="closeCollectionSelector"
      >
        <div class="collection-modal-card">
          <button
            class="modal-close-btn"
            @click="closeCollectionSelector"
          >
            ×
          </button>

          <h2>Save to Collection</h2>
          <p style="font-size: 13px; color: #777; margin: -8px 0 12px;">
            Select a collection folder to save this artwork:
          </p>

          <div v-if="userCollections.length === 0" class="empty-collections-notice">
            <p style="font-size: 13px; color: #888;">No collections yet.</p>
          </div>

          <div v-else class="collection-selector-list">
            <div
              v-for="coll in userCollections"
              :key="coll.id"
              class="collection-selector-item"
              @click="toggleArtworkInCollection(coll.id)"
            >
              <div class="collection-item-info">
                  <span class="collection-item-name">{{ coll.name }}</span>
                  <span class="collection-item-desc">{{ coll.description || 'No description' }}</span>
              </div>
              <div class="collection-item-check">
                {{ selectedCollectionIds.has(coll.id) ? '✓' : '+' }}
              </div>
            </div>
          </div>

          <div class="modal-actions" style="margin-top: 12px;">
            <button
              class="btn-primary"
              type="button"
              style="width: 100%;"
              @click="closeCollectionSelector"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- BOTTOM NAV -->
    <nav class="bottom-navigation">
      <button
        class="nav-item"
        @click="goTo('/home')"
      >
        <span class="nav-icon">⌂</span>
        <small>Home</small>
      </button>

      <button
        class="nav-item active"
        @click="goTo('/explore')"
      >
        <span class="nav-icon">⌕</span>
        <small>Explore</small>
      </button>

      <button
        class="nav-item"
        @click="goTo('/collection')"
      >
        <span class="nav-icon">♧</span>
        <small>Collection</small>
      </button>

      <button
        class="nav-item"
        @click="goTo('/favorite')"
      >
        <span class="nav-icon">♡</span>
        <small>Favorite</small>
      </button>
    </nav>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  onIonViewWillEnter
} from '@ionic/vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  ref,
  watch
} from 'vue'

import {
  searchArtworks,
  getDailyExploreArtworks
} from '@/services/artApi'

import '@/theme/explore.css'

/**
 * ⚠️ STATE LEVEL MODULE (di luar setup)
 * Ionic dengan createWebHistory merekrasi component setiap navigasi.
 * Agar data search & scroll tidak reset saat kembali dari ChatPage,
 * kita simpan cache artworks + query di module scope (survive selama app hidup).
 */
let _cachedArtworks: any[] = []
let _cachedQuery: string = ''
let _hasEverLoaded: boolean = false

const router = useRouter()
const route = useRoute()

const artworks = ref<any[]>(_cachedArtworks)

const loading = ref(false)
const errorMessage = ref('')

const selectedArtwork =
  ref<any | null>(null)

const searchQuery =
  ref(String(route.query.q || '').trim())

const searchInput =
  ref(searchQuery.value)

import {
  addFavorite,
  removeFavorite,
  getFavorites
} from '@/database/favoriteService'

import {
  getCollections,
  getCollectionsForArtwork,
  addArtworkToCollection,
  removeArtworkFromCollection,
  type Collection
} from '@/database/collectionService'

/*
|--------------------------------------------------------------------------
| FAVORITES
|--------------------------------------------------------------------------
*/

const likedArtworks = ref<Set<string>>(new Set())

async function loadUserFavorites() {
  try {
    const favorites = await getFavorites()
    likedArtworks.value = new Set(favorites.map(f => String(f.id)))
  } catch (error) {
    console.error('Failed to load favorites from database:', error)
  }
}

function isLiked(id: number | string): boolean {
  return likedArtworks.value.has(String(id))
}

async function toggleLike(id: number | string) {
  const artworkId = String(id)
  const isCurrentlyLiked = likedArtworks.value.has(artworkId)

  // Find the artwork using string comparison to support both Met (number) and Cleveland ("cma-xxx") IDs
  const targetArt = artworks.value.find(a => String(a.id) === artworkId) ||
    (selectedArtwork.value && String(selectedArtwork.value.id) === artworkId ? selectedArtwork.value : null)

  try {
    if (isCurrentlyLiked) {
      likedArtworks.value.delete(artworkId)
      likedArtworks.value = new Set(likedArtworks.value)
      await removeFavorite(artworkId)
    } else {
      likedArtworks.value.add(artworkId)
      likedArtworks.value = new Set(likedArtworks.value)
      if (targetArt) {
        await addFavorite({
          id: artworkId,
          title: targetArt.title || '',
          artist_display: targetArt.artist_display || '',
          date_display: cleanDate(targetArt.date_display) || '',
          museum: targetArt.museum || '',
          image_url: getArtworkSrc(targetArt),
          medium_display: targetArt.medium_display || '',
          artwork_type_title: targetArt.artwork_type_title || '',
          place_of_origin: targetArt.place_of_origin || '',
          dimensions: targetArt.dimensions || '',
          credit_line: targetArt.credit_line || '',
          description: getArtworkDescription(targetArt)
        })
      }
    }
  } catch (err) {
    console.error('Failed to toggle favorite state:', err)
    if (isCurrentlyLiked) {
      likedArtworks.value.add(artworkId)
    } else {
      likedArtworks.value.delete(artworkId)
    }
    likedArtworks.value = new Set(likedArtworks.value)
  }
}

/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

let requestId = 0

async function loadSearchResults() {
  const currentRequest =
    ++requestId

  loading.value = true
  errorMessage.value = ''

  try {
    const query =
      searchQuery.value.trim()

    if (!query) {
      const exploreData =
        await getDailyExploreArtworks(20)

      if (currentRequest !== requestId) {
        return
      }

      const result = Array.isArray(exploreData) ? exploreData : []
      artworks.value = result

      // Simpan ke module cache
      _cachedArtworks = result
      _cachedQuery = ''

      return
    }

    console.log(
      '[EXPLORE] Searching:',
      query
    )

    const result =
      await searchArtworks(query)

    if (currentRequest !== requestId) {
      return
    }

    const data =
      Array.isArray(result?.data)
        ? result.data
        : []

    console.log(
      '[EXPLORE] Results:',
      data.length,
      data
    )

    artworks.value = data

    // Simpan ke module cache
    _cachedArtworks = data
    _cachedQuery = query

  } catch (error) {
    console.error(
      '[EXPLORE] Search error:',
      error
    )

    if (currentRequest !== requestId) {
      return
    }

    errorMessage.value =
      'Failed to fetch artwork data.'

    artworks.value = []
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

function performSearch() {
  const query =
    searchInput.value.trim()

  searchQuery.value = query

  router.replace({
    path: '/explore',
    query: query
      ? { q: query }
      : {}
  })

  _hasEverLoaded = true  // mark sebagai sudah loaded (search manual)
  loadSearchResults()
}

function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  _cachedArtworks = []
  _cachedQuery = ''

  router.replace({
    path: '/explore'
  })

  _hasEverLoaded = true
  loadSearchResults()
}

watch(
  () => route.query.q,
  (newQ) => {
    const q =
      String(newQ || '').trim()

    if (
      q === searchQuery.value
    ) {
      return
    }

    searchQuery.value = q
    searchInput.value = q

    // Query URL berubah dari luar (bukan kembali dari Chat) → reload
    _hasEverLoaded = true
    loadSearchResults()
  }
)

/*
|--------------------------------------------------------------------------
| IMAGE HANDLING
|--------------------------------------------------------------------------
*/

const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg"
         width="400"
         height="400"
         viewBox="0 0 400 400">
      <rect
        width="400"
        height="400"
        fill="#e8e3da"
      />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="serif"
        font-size="18"
        fill="#888888"
      >
        Artwork
      </text>
    </svg>
  `)

function getArtworkSrc(
  art: any
): string {
  if (!art) {
    return DEFAULT_PLACEHOLDER
  }

  if (art._currentSrc) {
    return art._currentSrc
  }

  if (art.image_url) {
    return art.image_url
  }

  if (art.fallback_image) {
    return art.fallback_image
  }

  return DEFAULT_PLACEHOLDER
}

function handleImageError(
  event: Event,
  art: any
) {
  if (!art) {
    return
  }

  const img =
    event.target as HTMLImageElement

  if (!img) {
    return
  }

  /*
   * First failure:
   * image_url -> fallback_image
   */
  if (
    art.fallback_image &&
    img.src !== art.fallback_image
  ) {
    art._currentSrc =
      art.fallback_image

    img.src =
      art.fallback_image

    return
  }

  /*
   * Second failure:
   * fallback -> local placeholder
   *
   * JANGAN menghapus artwork dari hasil.
   */
  art._currentSrc =
    DEFAULT_PLACEHOLDER

  img.src =
    DEFAULT_PLACEHOLDER
}

/*
|--------------------------------------------------------------------------
| DATE / DESCRIPTION
|--------------------------------------------------------------------------
*/

function cleanDate(
  value?: string
): string {
  if (!value) {
    return ''
  }

  return String(value)
    .replace(
      /date\s*QS:[\s\S]*/gi,
      ''
    )
    .replace(
      /QS:P[\s\S]*/gi,
      ''
    )
    .replace(
      /\+?\d{4}-\d{2}-\d{2}T[\s\S]*/gi,
      ''
    )
    .replace(
      /<[^>]*>/gm,
      ''
    )
    .trim()
}

function cleanApiText(
  value: string | null | undefined
): string {
  if (!value) {
    return ''
  }

  const formattedHtml = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')

  const temp = document.createElement('div')
  temp.innerHTML = formattedHtml

  const text =
    temp.textContent ||
    temp.innerText ||
    ''

  return text
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getArtworkDescription(
  art: any
): string {
  if (!art) {
    return ''
  }

  if (art.short_description) {
    return cleanApiText(
      art.short_description
    )
  }

  if (art.description) {
    return cleanApiText(
      art.description
    )
  }

  return ''
}

/**
 * Parses a structured description string (double-newline separated sections,
 * where each section may have a "Label:\nvalue" format) into an array of
 * { label, value } objects for template rendering.
 */
function getDescriptionSections(
  art: any
): Array<{ label: string; value: string }> {
  const raw = getArtworkDescription(art)
  if (!raw) return []

  const sections = raw.split(/\n\n+/)
  return sections.map(section => {
    const firstNewline = section.indexOf('\n')
    if (firstNewline !== -1) {
      const potentialLabel = section.slice(0, firstNewline).trim()
      const valueText = section.slice(firstNewline + 1).trim()
      // Treat as label if it ends with ':' and value is non-empty
      if (potentialLabel.endsWith(':') && valueText) {
        return {
          label: potentialLabel.slice(0, -1), // remove trailing colon
          value: valueText
        }
      }
    }
    return { label: '', value: section.trim() }
  }).filter(s => s.value)
}

/*
|--------------------------------------------------------------------------
| DETAIL
|--------------------------------------------------------------------------
*/

function openArtworkDetail(
  art: any
) {
  selectedArtwork.value = art
}

function closeArtworkDetail() {
  selectedArtwork.value = null
}

/*
|--------------------------------------------------------------------------
| COLLECTION SELECTOR
|--------------------------------------------------------------------------
*/

const showCollectionSelector = ref(false)
const targetArtworkForCollection = ref<any | null>(null)
const userCollections = ref<Collection[]>([])
const selectedCollectionIds = ref<Set<number>>(new Set())

async function openCollectionSelector(art: any) {
  if (!art) return
  targetArtworkForCollection.value = art

  try {
    const allCollections = await getCollections()
    userCollections.value = allCollections

    const containingCollections = await getCollectionsForArtwork(art.id)
    selectedCollectionIds.value = new Set(containingCollections.map(c => c.id))

    showCollectionSelector.value = true
  } catch (err) {
    console.error('Gagal membuka pemilih koleksi:', err)
  }
}

function closeCollectionSelector() {
  showCollectionSelector.value = false
  targetArtworkForCollection.value = null
}

async function toggleArtworkInCollection(collectionId: number) {
  const art = targetArtworkForCollection.value
  if (!art) return

  const artworkId = art.id
  const isSelected = selectedCollectionIds.value.has(collectionId)

  try {
    if (isSelected) {
      selectedCollectionIds.value.delete(collectionId)
      selectedCollectionIds.value = new Set(selectedCollectionIds.value)
      await removeArtworkFromCollection(collectionId, artworkId)
    } else {
      selectedCollectionIds.value.add(collectionId)
      selectedCollectionIds.value = new Set(selectedCollectionIds.value)
      await addArtworkToCollection(collectionId, {
        artwork_id: artworkId,
        collection_id: collectionId,
        title: art.title || '',
        artist_display: art.artist_display || '',
        date_display: cleanDate(art.date_display) || '',
        museum: art.museum || '',
        image_url: getArtworkSrc(art),
        medium_display: art.medium_display || '',
        artwork_type_title: art.artwork_type_title || '',
        place_of_origin: art.place_of_origin || '',
        dimensions: art.dimensions || '',
        credit_line: art.credit_line || '',
        description: getArtworkDescription(art)
      })
    }
  } catch (err) {
    console.error('Gagal mengupdate koleksi artwork:', err)
  }
}

/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

function goBack() {
  router.push('/home')
}

function goTo(
  path: string
) {
  router.push(path)
}

function openChat(art: any) {
  closeArtworkDetail()
  router.push({ name: 'Chat', state: { artwork: JSON.stringify(art) } })
}

/*
|--------------------------------------------------------------------------
| INITIAL LOAD
|--------------------------------------------------------------------------
*/

onIonViewWillEnter(async () => {
  // Selalu refresh favorites (bisa berubah di halaman lain)
  await loadUserFavorites()

  if (!_hasEverLoaded) {
    // Pertama kali masuk Explore → load search
    _hasEverLoaded = true

    // Sync searchQuery dari URL jika ada
    const urlQuery = String(route.query.q || '').trim()
    if (urlQuery && urlQuery !== searchQuery.value) {
      searchQuery.value = urlQuery
      searchInput.value = urlQuery
    }

    loadSearchResults()
  } else {
    // Kembali dari ChatPage / halaman lain:
    // Restore data dari module cache tanpa re-fetch
    if (_cachedArtworks.length > 0) {
      artworks.value = _cachedArtworks
      searchQuery.value = _cachedQuery
      searchInput.value = _cachedQuery
    } else {
      // Cache kosong (misal session baru) → load
      loadSearchResults()
    }
  }
})
</script>
