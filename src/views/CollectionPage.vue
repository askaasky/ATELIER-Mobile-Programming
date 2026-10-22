<template>
  <ion-page style="--background: #151f2e; background: #151f2e;">
    <ion-content :fullscreen="true" style="--background: #151f2e; --ion-background-color: #151f2e;">

      <div class="collection-page">

        <!-- Header -->
        <div class="collection-header">

          <div>
            <p class="page-label">
              MY COLLECTION
            </p>

            <h1>
              Collection
            </h1>

            <p class="header-description">
              Save your favorite artworks into personal collections.
            </p>
          </div>

        </div>


        <!-- Loading -->
        <div
          v-if="loading"
          class="empty-state"
        >

          <div class="empty-icon">
            …
          </div>

          <h2>
            Loading collections...
          </h2>

          <p>
            Fetching your saved collections.
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
            Failed to load collections
          </h2>

          <p>
            {{ errorMessage }}
          </p>

          <button
            class="retry-button"
            type="button"
            @click="loadCollections"
          >
            Retry
          </button>

        </div>


        <!-- Collection Grid -->
        <div
          v-else
          class="collection-grid"
        >

          <div
            v-for="collection in collections"
            :key="collection.id"
            class="collection-card"
            @click="openCollection(collection.id)"
          >

            <!-- Cover -->
            <div class="collection-cover">

              <img
                :src="collection.coverImage"
                :alt="collection.name"
                @error="handleImageError"
              />

              <div class="artwork-count">
                {{ collection.count }} artworks
              </div>

            </div>


            <!-- Info -->
            <div class="collection-info">

              <div class="collection-title-row">

                <h2>
                  {{ collection.name }}
                </h2>

                <button
                  class="more-button"
                  type="button"
                  aria-label="Collection menu"
                  @click.stop="openMenu(collection.id)"
                >
                  ⋮
                </button>

              </div>

              <p>
                {{ collection.description }}
              </p>

            </div>

          </div>


          <!-- Empty -->
          <div
            v-if="collections.length === 0"
            class="empty-state"
          >

            <div class="empty-icon">
              ♡
            </div>

            <h2>
              No collections yet
            </h2>

            <p>
              Start saving your favorite artworks into collections.
            </p>

          </div>

        </div>


        <!-- Floating Add -->
        <button
          class="floating-add-button"
          type="button"
          aria-label="Create Collection"
          @click="openCreateCollection"
        >
          +
        </button>


        <!-- Create/Edit Collection Modal -->
        <div
          v-if="showModal"
          class="collection-modal-overlay"
          @click.self="closeModal"
        >
          <div class="collection-modal-card">
            <button
              class="modal-close-btn"
              @click="closeModal"
            >
              ×
            </button>

            <h2>{{ isEditing ? 'Edit Collection' : 'Create New Collection' }}</h2>

            <div class="modal-input-group">
              <label>Collection Name</label>
              <input
                v-model="collectionForm.name"
                type="text"
                class="modal-input"
                placeholder="e.g. Impressionism, Van Gogh..."
                @keyup.enter="saveCollection"
              />
            </div>

            <div class="modal-input-group">
              <label>Description (Optional)</label>
              <textarea
                v-model="collectionForm.description"
                class="modal-input"
                placeholder="Curated favorite artworks..."
              ></textarea>
            </div>

            <p v-if="formError" style="color: #e53935; font-size: 13px; margin: 0;">
              {{ formError }}
            </p>

            <div class="modal-actions">
              <button
                class="btn-secondary"
                type="button"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                class="btn-primary"
                type="button"
                :disabled="saving"
                @click="saveCollection"
              >
                {{ saving ? 'Saving...' : (isEditing ? 'Save' : 'Create') }}
              </button>
            </div>
          </div>
        </div>


        <!-- Menu Collection Options Modal -->
        <div
          v-if="activeMenuCollectionId !== null"
          class="collection-modal-overlay"
          @click.self="closeMenu"
        >
          <div class="collection-menu-modal">
            <button
              class="menu-item-btn"
              @click="handleEditFromMenu"
            >
              ✏️ Edit Collection
            </button>
            <button
              class="menu-item-btn danger"
              @click="handleDeleteFromMenu"
            >
              🗑️ Delete Collection
            </button>
          </div>
        </div>


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
            class="nav-item active"
            type="button"
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
            type="button"
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

      </div>

    </ion-content>
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
  ref,
  reactive
} from 'vue'

import { useRouter } from 'vue-router'

import '@/theme/collection.css'

import {
  getCollections,
  getCollectionArtworks,
  createCollection,
  updateCollection,
  deleteCollection,
  type Collection
} from '@/database/collectionService'


const router = useRouter()


/**
 * State
 */
const loading = ref(true)

const errorMessage = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editingCollectionId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')

const collectionForm = reactive({
  name: '',
  description: ''
})

const activeMenuCollectionId = ref<number | null>(null)


/**
 * Collection yang ditampilkan
 * oleh halaman.
 */
interface CollectionViewModel
  extends Collection {

  count: number

  coverImage: string
}


const collections =
  ref<CollectionViewModel[]>([])


/**
 * Mapping Collection database
 * menjadi data yang digunakan UI.
 */
async function buildCollection(
  collection: Collection
): Promise<CollectionViewModel> {

  const artworks =
    await getCollectionArtworks(
      collection.id
    )


  /**
   * Ambil gambar artwork terakhir
   * sebagai cover collection.
   */
  let coverImage =
    '/vann.webp'


  for (
    let index = artworks.length - 1;
    index >= 0;
    index--
  ) {

    const image =
      artworks[index].image_url

    if (image) {

      coverImage = image

      break

    }

  }


  return {

    ...collection,

    count: artworks.length,

    coverImage

  }

}


/**
 * Mengambil semua collection
 * dari SQLite.
 */
async function loadCollections() {

  loading.value = true

  errorMessage.value = ''


  try {

    const databaseCollections =
      await getCollections()


    const result: CollectionViewModel[] =
      []


    for (
      const collection
      of databaseCollections
    ) {

      try {

        const viewModel =
          await buildCollection(
            collection
          )

        result.push(
          viewModel
        )

      } catch (error) {

        console.error(
          `Gagal mengambil artwork collection ${collection.id}:`,
          error
        )


        /**
         * Collection tetap ditampilkan
         * walaupun artwork-nya gagal dibaca.
         */
        result.push({

          ...collection,

          count: 0,

          coverImage:
            '/vann.webp'

        })

      }

    }


    collections.value = result

  } catch (error) {

    console.error(
      'Gagal mengambil Collection:',
      error
    )

    errorMessage.value =
      'Collection data could not be loaded.'

  } finally {

    loading.value = false

  }

}


/**
 * Membuka collection.
 */
function openCollection(
  id: number
) {

  router.push(
    `/collection/${id}`
  )

}


/**
 * Membuka form collection baru.
 */
function openCreateCollection() {
  isEditing.value = false
  editingCollectionId.value = null
  collectionForm.name = ''
  collectionForm.description = ''
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formError.value = ''
}

async function saveCollection() {
  if (!collectionForm.name.trim()) {
    formError.value = 'Collection name cannot be empty.'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    if (isEditing.value && editingCollectionId.value !== null) {
      await updateCollection(
        editingCollectionId.value,
        collectionForm.name,
        collectionForm.description
      )
    } else {
      await createCollection(
        collectionForm.name,
        collectionForm.description
      )
    }

    closeModal()
    await loadCollections()
  } catch (err: any) {
    console.error('Gagal menyimpan koleksi:', err)
    formError.value = err.message || 'Failed to save collection.'
  } finally {
    saving.value = false
  }
}


/**
 * Menu collection.
 */
function openMenu(
  id: number
) {
  activeMenuCollectionId.value = id
}

function closeMenu() {
  activeMenuCollectionId.value = null
}

function handleEditFromMenu() {
  const targetId = activeMenuCollectionId.value
  closeMenu()
  if (targetId === null) return

  const item = collections.value.find(c => c.id === targetId)
  if (!item) return

  isEditing.value = true
  editingCollectionId.value = targetId
  collectionForm.name = item.name
  collectionForm.description = item.description || ''
  formError.value = ''
  showModal.value = true
}

async function handleDeleteFromMenu() {
  const targetId = activeMenuCollectionId.value
  closeMenu()
  if (targetId === null) return

  if (confirm('Are you sure you want to delete this collection? Artworks inside will not be deleted from favorites.')) {
    try {
      await deleteCollection(targetId)
      await loadCollections()
    } catch (err) {
      console.error('Gagal menghapus koleksi:', err)
    }
  }
}


/**
 * Navigasi bottom bar.
 */
function goTo(
  path: string
) {

  router.push(path)

}


/**
 * Fallback gambar.
 */
function handleImageError(
  event: Event
) {

  const img =
    event.target as HTMLImageElement


  if (
    img.src.endsWith(
      '/vann.webp'
    )
  ) {

    return

  }


  img.src =
    '/vann.webp'

}


/**
 * Load saat page dibuka.
 */
onIonViewWillEnter(() => {

  loadCollections()

})

</script>