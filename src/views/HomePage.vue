<template>
  <ion-page style="--background: #151f2e; background: #151f2e;">
    <ion-content :fullscreen="true" style="--background: #151f2e; --ion-background-color: #151f2e;">

      <div class="home-page">

        <!-- HEADER -->
        <header class="home-header">
          <div class="brand">
            <img src="/atelier.png" alt="Atelier Logo" class="brand-logo" />
            <span>Atelier</span>
          </div>

          <div class="header-profile">
            <div class="greeting">
              <span>Hello, Kay</span>
            </div>
          </div>
        </header>


        <!-- CONTENT -->
        <main class="home-content">

          <!-- WELCOME -->
          <section class="welcome-section">
            <p>
              Explore art, discover inspiring works,
              and build your collection.
            </p>
          </section>


          <!-- SEARCH -->
          <section class="search-section">
            <div class="search-box">

              <span
                class="search-icon"
                @click="handleSearch"
                style="cursor: pointer;"
              >
                ⌕
              </span>

              <input
                v-model="homeSearchQuery"
                type="text"
                placeholder="Search artwork..."
                @keyup.enter="handleSearch"
              />

            </div>
          </section>


          <!-- INSPIRATION -->
          <section class="section">

            <div class="section-title-row">
              <h2>Today's Inspiration</h2>
            </div>


            <!-- HERO SKELETON (while loading) -->
            <div
              v-if="!heroReady"
              class="hero-art hero-skeleton"
            >
              <div class="hero-skeleton-shimmer"></div>
            </div>


            <!-- HERO (ready) -->
            <div
              v-else
              class="hero-art hero-art-ready"
              @click="openArtworkDetail(currentHero)"
            >

              <Transition name="hero-fade" mode="out-in">
                <img
                  :key="currentHeroIndex"
                  :src="getArtworkSrc(currentHero)"
                  :alt="currentHero.title || 'Today\'s Inspiration'"
                  class="hero-img-animated"
                  @error="handleImageError($event, currentHero)"
                />
              </Transition>

              <div class="hero-overlay"></div>


              <div class="hero-content">

                <span class="hero-label">
                  TODAY'S INSPIRATION
                </span>

                <Transition name="hero-text-fade" mode="out-in">
                  <div :key="currentHeroIndex">
                    <h3>
                      {{ currentHero.title || 'The Starry Night' }}
                    </h3>

                    <p>
                      {{ currentHero.artist_display || 'Vincent van Gogh' }}
                    </p>
                  </div>
                </Transition>

              </div>


              <!-- DOT CAROUSEL -->
              <div class="carousel-dots">

                <span
                  v-for="(item, idx) in heroArtworks"
                  :key="idx"
                  class="dot"
                  :class="{ active: currentHeroIndex === idx }"
                  @click.stop="setHeroIndex(idx)"
                ></span>

              </div>

            </div>

          </section>



          <!-- EXPLORE ART -->
          <section class="section">

            <div class="section-title-row">
              <h2>Explore Art</h2>
            </div>


            <!-- BARIS PERTAMA -->
            <div class="art-scroll-container">

              <div class="art-scroll">

                <article
                  v-for="art in firstRowArtworks"
                  :key="'row1-' + art.id"
                  class="art-card"
                  @click="
                    openArtworkDetail(art)
                  "
                >

                  <!-- IMAGE -->
                  <div class="art-image">

                    <img
                      :src="
                        getArtworkSrc(art)
                      "
                      :alt="
                        art.title ||
                        'Artwork'
                      "
                      loading="lazy"
                      decoding="async"
                      @load="
                        handleImageLoad(art)
                      "
                      @error="
                        handleImageError(
                          $event,
                          art
                        )
                      "
                    />


                    <!-- FAVORITE -->
                    <button
                      class="card-like-button"
                      :class="{
                        liked:
                          isLiked(art.id)
                      }"
                      @click.stop="
                        toggleLike(art.id)
                      "
                      :title="
                        isLiked(art.id)
                          ? 'Remove Favorite'
                          : 'Favorite Artwork'
                      "
                    >
                      {{
                        isLiked(art.id)
                          ? '♥'
                          : '♡'
                      }}
                    </button>

                  </div>


                  <!-- TITLE -->
                  <h3>
                    {{
                      art.title ||
                      'Untitled'
                    }}
                  </h3>


                  <!-- ARTIST -->
                  <p class="artist">
                    {{
                      art.artist_display ||
                      'Unknown Artist'
                    }}
                  </p>


                  <!-- YEAR -->
                  <p class="year">
                    {{
                      art.date_display ||
                      'Date unavailable'
                    }}
                  </p>


                  <!-- MUSEUM -->
                  <p class="museum">
                    ♜ &nbsp;
                    {{
                      art.museum ||
                      'Art Institute of Chicago'
                    }}
                  </p>

                </article>

              </div>

            </div>


            <!-- BARIS KEDUA -->
            <div class="art-scroll-container">

              <div class="art-scroll">

                <article
                  v-for="art in secondRowArtworks"
                  :key="'row2-' + art.id"
                  class="art-card"
                  @click="
                    openArtworkDetail(art)
                  "
                >

                  <!-- IMAGE -->
                  <div class="art-image">

                    <img
                      :src="
                        getArtworkSrc(art)
                      "
                      :alt="
                        art.title ||
                        'Artwork'
                      "
                      loading="lazy"
                      decoding="async"
                      @load="
                        handleImageLoad(art)
                      "
                      @error="
                        handleImageError(
                          $event,
                          art
                        )
                      "
                    />


                    <!-- FAVORITE -->
                    <button
                      class="card-like-button"
                      :class="{
                        liked:
                          isLiked(art.id)
                      }"
                      @click.stop="
                        toggleLike(art.id)
                      "
                      :title="
                        isLiked(art.id)
                          ? 'Remove Favorite'
                          : 'Favorite Artwork'
                      "
                    >
                      {{
                        isLiked(art.id)
                          ? '♥'
                          : '♡'
                      }}
                    </button>

                  </div>


                  <!-- TITLE -->
                  <h3>
                    {{
                      art.title ||
                      'Untitled'
                    }}
                  </h3>


                  <!-- ARTIST -->
                  <p class="artist">
                    {{
                      art.artist_display ||
                      'Unknown Artist'
                    }}
                  </p>


                  <!-- YEAR -->
                  <p class="year">
                    {{
                      art.date_display ||
                      'Date unavailable'
                    }}
                  </p>


                  <!-- MUSEUM -->
                  <p class="museum">
                    ♜ &nbsp;
                    {{
                      art.museum ||
                      'Art Institute of Chicago'
                    }}
                  </p>

                </article>

              </div>

            </div>

          </section>


        </main>
      </div>
    </ion-content>

    <!-- ARTWORK DETAIL MODAL -->
    <teleport to="body">
      <div
        v-if="selectedArtwork"
        class="artwork-modal-overlay"
        @click.self="
          closeArtworkDetail
        "
      >

        <div class="artwork-modal-card">

          <!-- CLOSE -->
          <button
            class="modal-close-btn"
            @click="
              closeArtworkDetail
            "
            aria-label="Close"
          >
            ×
          </button>


          <!-- FULL ARTWORK IMAGE -->
          <div class="modal-img-full">

            <img
              :src="
                getArtworkSrc(
                  selectedArtwork
                )
              "
              :alt="
                selectedArtwork.title ||
                'Artwork'
              "
              @error="
                handleImageError(
                  $event,
                  selectedArtwork
                )
              "
            />

          </div>


          <!-- INFO -->
          <div class="modal-body">

            <!-- TITLE -->
            <div class="modal-title-block">

              <h2 class="modal-title">
                {{
                  selectedArtwork.title ||
                  'Untitled'
                }}
              </h2>

              <p class="modal-artist-name">
                {{
                  selectedArtwork.artist_display ||
                  'Unknown Artist'
                }}
              </p>

            </div>


            <!-- MUSEUM -->
            <p class="modal-museum-tag">

              <span class="modal-museum-icon">
                ♜
              </span>

              {{
                selectedArtwork.museum ||
                'Art Institute of Chicago'
              }}

            </p>


            <!-- METADATA -->
            <div class="modal-meta">

              <span
                v-if="
                  selectedArtwork.date_display
                "
                class="modal-meta-item"
              >
                {{
                  selectedArtwork.date_display
                }}
              </span>

              <span
                v-if="
                  selectedArtwork.medium_display
                "
                class="modal-meta-item"
              >
                {{
                  selectedArtwork.medium_display
                }}
              </span>

              <span
                v-if="
                  selectedArtwork.artwork_type_title
                "
                class="modal-meta-item"
              >
                {{
                  selectedArtwork.artwork_type_title
                }}
              </span>

            </div>


            <div class="modal-divider"></div>


            <!-- DESCRIPTION -->
            <div class="modal-desc-block">

              <p class="modal-desc-label">
                About Artwork
              </p>

              <p
                v-if="
                  getArtworkDescription(
                    selectedArtwork
                  )
                "
                class="modal-desc-text"
              >
                {{
                  getArtworkDescription(
                    selectedArtwork
                  )
                }}
              </p>

              <p
                v-else
                class="modal-desc-empty"
              >
                No description available for this artwork
                in the Art Institute of Chicago collection data.
              </p>

            </div>


            <!-- EXTRA INFORMATION -->
            <div
              v-if="
                selectedArtwork.place_of_origin ||
                selectedArtwork.dimensions ||
                selectedArtwork.credit_line
              "
              class="modal-extra-info"
            >

              <div
                v-if="
                  selectedArtwork.place_of_origin
                "
                class="extra-info-row"
              >
                <span class="extra-info-label">
                  Origin
                </span>

                <span class="extra-info-value">
                  {{
                    selectedArtwork.place_of_origin
                  }}
                </span>
              </div>


              <div
                v-if="
                  selectedArtwork.dimensions
                "
                class="extra-info-row"
              >
                <span class="extra-info-label">
                  Dimensions
                </span>

                <span class="extra-info-value">
                  {{
                    selectedArtwork.dimensions
                  }}
                </span>
              </div>


              <div
                v-if="
                  selectedArtwork.credit_line
                "
                class="extra-info-row"
              >
                <span class="extra-info-label">
                  Collection
                </span>

                <span class="extra-info-value">
                  {{
                    selectedArtwork.credit_line
                  }}
                </span>
              </div>

            </div>


            <!-- ACTION BUTTONS (FAVORITE & COLLECTION) -->
            <div class="modal-actions-row">
              <button
                class="modal-fav-btn"
                :class="{
                  liked:
                    isLiked(
                      selectedArtwork.id
                    )
                }"
                @click="
                  toggleLike(
                    selectedArtwork.id
                  )
                "
              >
                <span class="modal-fav-icon">
                  {{
                    isLiked(
                      selectedArtwork.id
                    )
                      ? '♥'
                      : '♡'
                  }}
                </span>
                <span>
                  {{
                    isLiked(
                      selectedArtwork.id
                    )
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

    <!-- BOTTOM NAVIGATION -->
    <nav class="bottom-navigation">

      <button
        class="nav-item active"
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
        @click="goTo('/explore')"
      >
        <span class="nav-icon">
          ⌕
        </span>

        <span>
          Searching
        </span>
      </button>


      <button
        class="nav-item"
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
        class="nav-item"
        @click="goTo('/favorite')"
      >
        <span class="nav-icon">
          ♡
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
  useRouter
} from 'vue-router'

import {
  ref,
  computed,
  onMounted,
  onUnmounted
} from 'vue'

import {
  getArtworks,
  FALLBACK_ARTWORKS,
  rotateDaily
} from '@/services/artApi'

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

import '@/theme/home.css'

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const router = useRouter()

const homeSearchQuery = ref('')

function handleSearch() {
  const query = homeSearchQuery.value.trim()

  if (query) {
    router.push({
      path: '/explore',
      query: {
        q: query
      }
    })
  } else {
    router.push('/explore')
  }
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

const isLoading = ref(true)

/*
|--------------------------------------------------------------------------
| ARTWORK DATA
|--------------------------------------------------------------------------
*/

const artworks = ref<any[]>([])
const isLoadingArtworks = ref(true)
const heroReady = ref(false)

const firstRowArtworks = computed(() => {
  return artworks.value.slice(0, 4)
})

const secondRowArtworks = computed(() => {
  return artworks.value.slice(4, 8)
})

/*
|--------------------------------------------------------------------------
| HERO
|--------------------------------------------------------------------------
*/

const currentHeroIndex = ref(0)

let heroInterval:
  ReturnType<typeof setInterval> | null = null

const DEFAULT_HERO = {
  id: 'hero-default',
  title: 'The Starry Night',
  artist_display: 'Vincent van Gogh',
  date_display: '1889',
  museum: 'Museum of Modern Art',
  image_url: '/vann.webp'
}

/*
|--------------------------------------------------------------------------
| HERO ARTWORKS
|--------------------------------------------------------------------------
|
| Selama API belum selesai, kita tidak memakai DEFAULT_HERO
| sebagai tampilan Home karena seluruh Home masih loading.
|
|--------------------------------------------------------------------------
*/

const heroArtworks = computed(() => {
  return artworks.value.slice(0, 5)
})

const currentHero = computed(() => {
  const list = heroArtworks.value

  if (!list.length) {
    return DEFAULT_HERO
  }

  return (
    list[
      currentHeroIndex.value % list.length
    ] || list[0]
  )
})

function setHeroIndex(idx: number) {
  currentHeroIndex.value = idx
}

function startHeroAutoPlay() {
  stopHeroAutoPlay()

  heroInterval = setInterval(() => {
    if (heroArtworks.value.length > 0) {
      currentHeroIndex.value =
        (
          currentHeroIndex.value + 1
        ) %
        heroArtworks.value.length
    }
  }, 4500)
}

function stopHeroAutoPlay() {
  if (heroInterval) {
    clearInterval(heroInterval)
    heroInterval = null
  }
}

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

  // Find artwork data from list
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
          date_display: targetArt.date_display || '',
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
    // Rollback if database call fails
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
| ARTWORK DETAIL
|--------------------------------------------------------------------------
*/

const selectedArtwork =
  ref<any | null>(null)

function openArtworkDetail(art: any) {
  if (!art) return

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
        date_display: art.date_display || '',
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
| CLEAN API DESCRIPTION
|--------------------------------------------------------------------------
*/

function cleanApiText(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) return ''

  const formattedHtml =
    value
      .replace(
        /<br\s*\/?>/gi,
        '\n'
      )
      .replace(
        /<\/?p>/gi,
        '\n'
      )

  const temp =
    document.createElement('div')

  temp.innerHTML =
    formattedHtml

  const text =
    temp.textContent ||
    temp.innerText ||
    ''

  return text
    .split('\n')
    .map(line =>
      line.trim()
    )
    .join('\n')
    .replace(
      /\n{3,}/g,
      '\n\n'
    )
    .trim()
}

function getArtworkDescription(
  art: any
): string {
  if (!art) return ''

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

/*
|--------------------------------------------------------------------------
| IMAGE
|--------------------------------------------------------------------------
*/

const DEFAULT_PLACEHOLDER =
  `data:image/svg+xml;utf8,
  <svg xmlns="http://www.w3.org/2000/svg"
  width="400"
  height="400"
  viewBox="0 0 400 400">
  <rect
    width="400"
    height="400"
    fill="%23e8e3da"
  />
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="serif"
    font-size="18"
    fill="%23888888"
  >
    Artwork
  </text>
  </svg>`

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

function handleImageLoad(
  art: any
) {
  if (art) {
    console.log(
      'Gambar API dimuat:',
      art.title
    )
  }
}

function handleImageError(
  event: Event,
  art: any
) {
  if (!art) return

  /*
   * Jangan langsung menghapus artwork ketika
   * gambar gagal pada hero.
   *
   * Ini mencegah hero tiba-tiba menghilang.
   */

  const target =
    event.target as HTMLImageElement

  if (
    target &&
    target.dataset.fallbackApplied !== 'true'
  ) {
    target.dataset.fallbackApplied = 'true'

    if (art.fallback_image) {
      target.src =
        art.fallback_image

      return
    }

    target.src =
      DEFAULT_PLACEHOLDER

    return
  }

  /*
   * Untuk card artwork,
   * jika benar-benar gagal, artwork boleh
   * dihapus dari daftar.
   */

  if (art.id) {
    artworks.value =
      artworks.value.filter(
        item =>
          item.id !== art.id
      )
  }

  if (
    selectedArtwork.value &&
    selectedArtwork.value.id ===
      art.id
  ) {
    selectedArtwork.value = null
  }
}

/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

function goTo(path: string) {
  router.push(path)
}

function openChat(art: any) {
  closeArtworkDetail()
  router.push({ name: 'Chat', state: { artwork: JSON.stringify(art) } })
}

/*
|--------------------------------------------------------------------------
| LOAD API
|--------------------------------------------------------------------------
*/

async function loadArtworks() {
  isLoading.value = true

  try {
    console.log(
      'Mengambil artwork dari API...'
    )

    const result =
      await getArtworks()

    console.log(
      'API ARTWORK:',
      result.data
    )

    /*
     * Masukkan data API terlebih dahulu.
     */

    artworks.value =
      result.data || []

    /*
     * Pastikan hero dimulai dari artwork pertama.
     */

    currentHeroIndex.value = 0

    /*
     * Baru setelah data tersedia,
     * autoplay dijalankan.
     */

    startHeroAutoPlay()

  } catch (error) {
    console.error(
      'Gagal mengambil data artwork:',
      error
    )

    /*
     * Kalau API gagal, Home tetap bisa
     * ditampilkan menggunakan DEFAULT_HERO.
     */

    artworks.value = []

  } finally {
    /*
     * Loading selesai setelah API selesai.
     */

    isLoading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| MOUNT
|--------------------------------------------------------------------------
*/

onIonViewWillEnter(async () => {
  await loadUserFavorites()

  isLoadingArtworks.value = true
  heroReady.value = false

  try {
    const result = await getArtworks()

    artworks.value = Array.isArray(result.data) && result.data.length > 0
      ? result.data
      : rotateDaily([...FALLBACK_ARTWORKS])

    currentHeroIndex.value = 0

    /*
     * Tunda sebentar agar browser sempat merender
     * gambar pertama sebelum fade-in dimulai.
     */
    await new Promise(resolve => setTimeout(resolve, 80))

    heroReady.value = true
    startHeroAutoPlay()

  } catch (error) {
    console.error('Gagal mengambil data artwork:', error)
    artworks.value = rotateDaily([...FALLBACK_ARTWORKS])
    currentHeroIndex.value = 0
    heroReady.value = true
    startHeroAutoPlay()
  } finally {
    isLoadingArtworks.value = false
  }
})

/*
|--------------------------------------------------------------------------
| UNMOUNT
|--------------------------------------------------------------------------
*/

onUnmounted(() => {
  stopHeroAutoPlay()
})
</script>