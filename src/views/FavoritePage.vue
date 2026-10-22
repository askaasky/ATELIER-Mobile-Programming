<template>
  <ion-page style="--background: #151f2e; background: #151f2e;">
    <ion-content :fullscreen="true" style="--background: #151f2e; --ion-background-color: #151f2e;">

      <div class="favorite-page">

        <!-- Header -->
        <header class="favorite-header">
          <p class="page-label">
            YOUR FAVORITES
          </p>

          <h1>Favorites</h1>

          <p class="header-description">
            Artworks you love.
          </p>
        </header>


        <!-- Favorite Feed -->
        <main class="favorite-feed">

          <!-- Loading -->
          <div
            v-if="loading"
            class="empty-state"
          >
            <div class="empty-icon">
              …
            </div>

            <h2>
              Loading favorites...
            </h2>

            <p>
              Fetching your saved artworks.
            </p>
          </div>


          <!-- Error -->
          <div
            v-else-if="errorMessage"
            class="empty-state"
          >
            <div class="empty-icon">
              !
            </div>

            <h2>
              Failed to load favorites
            </h2>

            <p>
              {{ errorMessage }}
            </p>

            <button
              class="retry-button"
              @click="loadFavorites"
            >
              Retry
            </button>
          </div>


          <!-- Favorites -->
          <template v-else>

            <article
              v-for="artwork in favoriteArtworks"
              :key="artwork.id"
              class="favorite-card"
              @click="openArtworkDetail(artwork.raw)"
            >

              <!-- Artwork -->
              <div
                class="favorite-image"
              >

                <img
                  :src="artwork.image"
                  :alt="artwork.title || 'Artwork'"
                  @error="handleImageError"
                />

              </div>


              <!-- Info -->
              <div class="favorite-info">

                <div class="favorite-title-row">

                  <div>
                    <h2>
                      {{ artwork.title || 'Untitled' }}
                    </h2>

                    <p class="artist">
                      {{ artwork.artist }}
                    </p>
                  </div>


                  <!-- Like -->
                  <button
                    class="like-button liked"
                    type="button"
                    aria-label="Remove from favorites"
                    @click.stop="removeArtwork(artwork.id)"
                  >
                    ♥
                  </button>

                </div>


                <div class="artwork-meta">

                  <span v-if="artwork.year">
                    {{ artwork.year }}
                  </span>

                  <span v-if="artwork.museum">
                    {{ artwork.museum }}
                  </span>

                </div>

              </div>

            </article>


            <!-- Empty -->
            <div
              v-if="favoriteArtworks.length === 0"
              class="empty-state"
            >

              <div class="empty-icon">
                ♡
              </div>

              <h2>
                No favorite artworks yet
              </h2>

              <p>
                Tap the heart icon on any artwork you want to save here.
              </p>

            </div>

          </template>

        </main>
      </div>
    </ion-content>

    <!-- ARTWORK DETAIL MODAL -->
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
              <span v-if="selectedArtwork.date_display" class="modal-meta-item">
                {{ selectedArtwork.date_display }}
              </span>
              <span v-if="selectedArtwork.medium_display" class="modal-meta-item">
                {{ selectedArtwork.medium_display }}
              </span>
              <span v-if="selectedArtwork.artwork_type_title" class="modal-meta-item">
                {{ selectedArtwork.artwork_type_title }}
              </span>
            </div>

            <div class="modal-divider"></div>

            <div class="modal-desc-block">
              <p class="modal-desc-label">About Artwork</p>
              <p v-if="selectedArtwork.description" class="modal-desc-text">
                {{ selectedArtwork.description }}
              </p>
              <p v-else class="modal-desc-empty">
                No description available for this artwork.
              </p>
            </div>

            <div
              v-if="selectedArtwork.place_of_origin || selectedArtwork.dimensions || selectedArtwork.credit_line"
              class="modal-extra-info"
            >
              <div v-if="selectedArtwork.place_of_origin" class="extra-info-row">
                <span class="extra-info-label">Origin</span>
                <span class="extra-info-value">{{ selectedArtwork.place_of_origin }}</span>
              </div>
              <div v-if="selectedArtwork.dimensions" class="extra-info-row">
                <span class="extra-info-label">Dimensions</span>
                <span class="extra-info-value">{{ selectedArtwork.dimensions }}</span>
              </div>
              <div v-if="selectedArtwork.credit_line" class="extra-info-row">
                <span class="extra-info-label">Collection</span>
                <span class="extra-info-value">{{ selectedArtwork.credit_line }}</span>
              </div>
            </div>

            <div class="modal-actions-row">
              <button
                class="modal-fav-btn liked"
                @click="removeArtworkFromModal(selectedArtwork.id)"
              >
                <span class="modal-fav-icon">♥</span>
                <span>Favorite</span>
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

    <!-- Bottom Nav -->
    <nav class="bottom-nav">

      <button
        class="nav-item"
        type="button"
        @click="goTo('/home')"
      >
        <span class="nav-icon">
          ⌂
        </span>

        <span>
          Home
        </span>
      </button>


      <button
        class="nav-item"
        type="button"
        @click="goTo('/explore')"
      >
        <span class="nav-icon">
          ⌕
        </span>

        <span>
          Explore
        </span>
      </button>


      <button
        class="nav-item"
        type="button"
        @click="goTo('/collection')"
      >
        <span class="nav-icon">
          ♧
        </span>

        <span>
          Collection
        </span>
      </button>


      <button
        class="nav-item active"
        type="button"
      >
        <span class="nav-icon">
          ♥
        </span>

        <span>
          Favorite
        </span>
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
  onMounted,
  ref
} from 'vue'

import { useRouter } from 'vue-router'

import '@/theme/favorite.css'
import '@/theme/explore.css'

import {
  getFavorites,
  removeFavorite as removeFavoriteFromDatabase,
  type FavoriteArtwork
} from '@/database/favoriteService'

import {
  getCollections,
  getCollectionsForArtwork,
  addArtworkToCollection,
  removeArtworkFromCollection,
  type Collection
} from '@/database/collectionService'

const router = useRouter()

/**
 * State
 */
const loading = ref(true)
const errorMessage = ref('')
const selectedArtwork = ref<FavoriteArtwork | null>(null)

const showCollectionSelector = ref(false)
const targetArtworkForCollection = ref<any | null>(null)
const userCollections = ref<Collection[]>([])
const selectedCollectionIds = ref<Set<number>>(new Set())

/**
 * Data dari SQLite.
 */
const favoriteArtworks = ref<
  Array<{
    id: number | string
    title: string
    artist: string
    year: string
    museum: string
    image: string
    raw: FavoriteArtwork
  }>
>([])

/**
 * Mengubah data SQLite menjadi
 * format yang dipakai template.
 */
function mapFavorite(artwork: FavoriteArtwork) {
  return {
    id: artwork.id,
    title: artwork.title ?? '',
    artist: artwork.artist_display ?? '',
    year: artwork.date_display ?? '',
    museum: artwork.museum ?? '',
    image: artwork.image_url || '/vann.webp',
    raw: artwork
  }
}

/**
 * Mengambil Favorite dari SQLite.
 */
async function loadFavorites() {
  loading.value = true
  errorMessage.value = ''

  try {
    const favorites = await getFavorites()
    favoriteArtworks.value = favorites.map(mapFavorite)
  } catch (error) {
    console.error('Gagal mengambil Favorite:', error)
    errorMessage.value = 'Favorite data could not be loaded.'
  } finally {
    loading.value = false
  }
}

/**
 * Menghapus artwork dari SQLite.
 */
async function removeArtwork(artworkId: number | string) {
  try {
    await removeFavoriteFromDatabase(artworkId)
    favoriteArtworks.value = favoriteArtworks.value.filter(
      artwork => String(artwork.id) !== String(artworkId)
    )
  } catch (error) {
    console.error('Failed to remove Favorite:', error)
    errorMessage.value = 'Failed to remove artwork from favorites.'
  }
}

async function removeArtworkFromModal(artworkId: number | string) {
  await removeArtwork(artworkId)
  closeArtworkDetail()
}

function openArtworkDetail(art: FavoriteArtwork) {
  selectedArtwork.value = art
}

function closeArtworkDetail() {
  selectedArtwork.value = null
}

function getArtworkSrc(art: FavoriteArtwork): string {
  return art?.image_url || '/vann.webp'
}

/*
|--------------------------------------------------------------------------
| COLLECTION SELECTOR
|--------------------------------------------------------------------------
*/

async function openCollectionSelector(art: FavoriteArtwork) {
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
        date_display: art.date_display || '',
        museum: art.museum || '',
        image_url: getArtworkSrc(art),
        medium_display: art.medium_display || '',
        artwork_type_title: art.artwork_type_title || '',
        place_of_origin: art.place_of_origin || '',
        dimensions: art.dimensions || '',
        credit_line: art.credit_line || '',
        description: art.description || ''
      })
    }
  } catch (err) {
    console.error('Gagal mengupdate koleksi artwork:', err)
  }
}

/**
 * Navigasi.
 */
function goTo(path: string) {
  router.push(path)
}

function openChat(art: any) {
  closeArtworkDetail()
  router.push({ name: 'Chat', state: { artwork: JSON.stringify(art) } })
}

/**
 * Fallback gambar.
 */
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src.endsWith('/vann.webp')) {
    return
  }
  img.src = '/vann.webp'
}

/**
 * Load ketika page dibuka kembali (Ionic Lifecycle).
 */
onIonViewWillEnter(() => {
  loadFavorites()
})

</script>