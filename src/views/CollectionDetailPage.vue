<template>
  <ion-page style="--background: #151f2e; background: #151f2e;">
    <ion-content :fullscreen="true" style="--background: #151f2e; --ion-background-color: #151f2e;">

      <div class="collection-detail-page">

        <!-- Header -->
        <header class="detail-header">

          <button
            class="back-button"
            @click="goBack"
          >
            ←
          </button>

          <div class="header-info">
            <p class="page-label">COLLECTION</p>

            <h1>{{ collection?.name ?? 'Collection' }}</h1>

            <p>
              {{ artworks.length }} artworks
            </p>
          </div>

          <button
            class="menu-button"
            @click="openMenu"
          >
            ⋮
          </button>

        </header>


        <!-- Description -->
        <section
          v-if="collection"
          class="collection-description"
        >
          <p>
            {{ collection.description }}
          </p>
        </section>


        <!-- Loading -->
        <div
          v-if="loading"
          class="empty-state"
        >
          <p>
            Loading collection...
          </p>
        </div>


        <!-- Artwork Grid -->
        <section
          v-else-if="artworks.length > 0"
          class="artwork-grid"
        >

          <article
            v-for="artwork in artworks"
            :key="artwork.id"
            class="artwork-card"
            @click="openArtworkDetail(artwork)"
          >

            <div class="artwork-image">

              <img
                :src="artwork.image_url || fallbackImage"
                :alt="artwork.title || 'Artwork'"
              />

              <button
                class="remove-button"
                @click.stop="removeArtwork(artwork.artwork_id)"
              >
                ×
              </button>

            </div>


            <div class="artwork-info">

              <h2>
                {{ artwork.title || 'Untitled Artwork' }}
              </h2>

              <p>
                {{ artwork.artist_display || 'Unknown Artist' }}
              </p>

            </div>

          </article>

        </section>


        <!-- Empty -->
        <div
          v-else
          class="empty-state"
        >

          <div class="empty-icon">
            ♡
          </div>

          <h2>
            Collection is empty
          </h2>

          <p>
            Save artworks from Explore Art to this collection.
          </p>

        </div>
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
              :src="selectedArtwork.image_url || fallbackImage"
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
                class="modal-fav-btn"
                :class="{ liked: isLiked(selectedArtwork.artwork_id) }"
                @click="toggleLikeFromModal(selectedArtwork)"
              >
                <span class="modal-fav-icon">{{ isLiked(selectedArtwork.artwork_id) ? '♥' : '♡' }}</span>
                <span>{{ isLiked(selectedArtwork.artwork_id) ? 'Favorite' : 'Add to Favorite' }}</span>
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
              class="cd-done-btn"
              type="button"
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
        @click="goTo('/home')"
      >
        <span class="nav-icon">⌂</span>
        <span>Home</span>
      </button>

      <button
        class="nav-item"
        @click="goTo('/explore')"
      >
        <span class="nav-icon">⌕</span>
        <span>Explore</span>
      </button>

      <button
        class="nav-item active"
        @click="goTo('/collection')"
      >
        <span class="nav-icon">♧</span>
        <span>Collection</span>
      </button>

      <button
        class="nav-item"
        @click="goTo('/favorite')"
      >
        <span class="nav-icon">♡</span>
        <span>Favorite</span>
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

import {
  useRoute,
  useRouter
} from 'vue-router'

import '@/theme/collection-detail.css'
import '@/theme/explore.css'
import '@/theme/collection.css'

import {
  getCollection,
  getCollectionArtworks,
  removeArtworkFromCollection,
  getCollections,
  getCollectionsForArtwork,
  addArtworkToCollection,
  type Collection,
  type CollectionArtwork
} from '@/database/collectionService'

import {
  addFavorite,
  removeFavorite,
  getFavorites
} from '@/database/favoriteService'

const router = useRouter()
const route = useRoute()

const collectionId = Number(route.params.id)

const collection = ref<Collection | null>(null)
const artworks = ref<CollectionArtwork[]>([])
const loading = ref(true)

const selectedArtwork = ref<CollectionArtwork | null>(null)
const likedArtworks = ref<Set<string>>(new Set())

const showCollectionSelector = ref(false)
const targetArtworkForCollection = ref<any | null>(null)
const userCollections = ref<Collection[]>([])
const selectedCollectionIds = ref<Set<number>>(new Set())

const fallbackImage = '/vann.webp'

async function loadCollection() {
  try {
    loading.value = true

    collection.value = await getCollection(collectionId)
    artworks.value = await getCollectionArtworks(collectionId)

    const favs = await getFavorites()
    likedArtworks.value = new Set(favs.map(f => String(f.id)))
  } catch (error) {
    console.error('Failed to load collection:', error)
  } finally {
    loading.value = false
  }
}

function isLiked(artworkId: number | string): boolean {
  return likedArtworks.value.has(String(artworkId))
}

async function toggleLikeFromModal(art: CollectionArtwork) {
  const artId = String(art.artwork_id || art.id)
  const currentlyLiked = likedArtworks.value.has(artId)

  try {
    if (currentlyLiked) {
      likedArtworks.value.delete(artId)
      likedArtworks.value = new Set(likedArtworks.value)
      await removeFavorite(artId)
    } else {
      likedArtworks.value.add(artId)
      likedArtworks.value = new Set(likedArtworks.value)
      await addFavorite({
        id: artId,
        title: art.title || '',
        artist_display: art.artist_display || '',
        date_display: art.date_display || '',
        museum: art.museum || '',
        image_url: art.image_url || fallbackImage,
        medium_display: art.medium_display || '',
        artwork_type_title: art.artwork_type_title || '',
        place_of_origin: art.place_of_origin || '',
        dimensions: art.dimensions || '',
        credit_line: art.credit_line || '',
        description: art.description || ''
      })
    }
  } catch (err) {
    console.error('Failed to toggle favorite from detail modal:', err)
  }
}

function openArtworkDetail(art: CollectionArtwork) {
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

async function openCollectionSelector(art: CollectionArtwork) {
  if (!art) return
  targetArtworkForCollection.value = art

  try {
    const allCollections = await getCollections()
    userCollections.value = allCollections

    const containingCollections = await getCollectionsForArtwork(art.artwork_id || art.id || '')
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

async function toggleArtworkInCollection(targetCollId: number) {
  const art = targetArtworkForCollection.value
  if (!art) return

  const artworkId = art.artwork_id || art.id || ''
  const isSelected = selectedCollectionIds.value.has(targetCollId)

  try {
    if (isSelected) {
      selectedCollectionIds.value.delete(targetCollId)
      selectedCollectionIds.value = new Set(selectedCollectionIds.value)
      await removeArtworkFromCollection(targetCollId, artworkId)
    } else {
      selectedCollectionIds.value.add(targetCollId)
      selectedCollectionIds.value = new Set(selectedCollectionIds.value)
      await addArtworkToCollection(targetCollId, {
        artwork_id: artworkId,
        collection_id: targetCollId,
        title: art.title || '',
        artist_display: art.artist_display || '',
        date_display: art.date_display || '',
        museum: art.museum || '',
        image_url: art.image_url || fallbackImage,
        medium_display: art.medium_display || '',
        artwork_type_title: art.artwork_type_title || '',
        place_of_origin: art.place_of_origin || '',
        dimensions: art.dimensions || '',
        credit_line: art.credit_line || '',
        description: art.description || ''
      })
    }

    // Refresh if modifying current collection
    if (targetCollId === collectionId) {
      artworks.value = await getCollectionArtworks(collectionId)
    }
  } catch (err) {
    console.error('Gagal mengupdate koleksi artwork:', err)
  }
}

function goBack() {
  router.back()
}

function goTo(path: string) {
  router.push(path)
}

function openChat(art: any) {
  closeArtworkDetail()
  router.push({ name: 'Chat', state: { artwork: JSON.stringify(art) } })
}

async function removeArtwork(artworkId: number | string) {
  try {
    await removeArtworkFromCollection(collectionId, artworkId)
    await loadCollection()
  } catch (error) {
    console.error('Gagal menghapus artwork dari collection:', error)
  }
}

function openMenu() {
  alert('Collection menu')
}

onIonViewWillEnter(() => {
  loadCollection()
})

</script>