<template>
  <ion-page class="chat-page">
    <ion-header class="chat-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="" />
        </ion-buttons>

        <ion-title>
          <div class="header-title-container">
            <span class="header-ai-icon">✦</span>
            <span class="header-title-text">Atelier Curator AI</span>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" :fullscreen="true" class="chat-content">
      <div class="chat-container">

        <!-- ARTWORK CONTEXT BANNER (When viewing a painting) -->
        <div v-if="artworkData" class="artwork-context-card">
          <div class="context-img-wrapper">
            <img :src="artworkData.image_url || '/vann.webp'" :alt="artworkData.title || 'Artwork'" />
          </div>
          <div class="context-info">
            <span class="context-tag">Aktif Ditinjau</span>
            <h3 class="context-title">{{ artworkData.title || 'Untitled Artwork' }}</h3>
            <p class="context-artist">{{ artworkData.artist || artworkData.artist_display || 'Unknown Artist' }}</p>
            <p class="context-museum">♜ {{ artworkData.museum || 'Museum Collection' }}</p>
          </div>
        </div>

        <!-- Intro (When no messages) -->
        <div v-if="messages.length === 0" class="chat-intro">
          <div class="ai-icon">
            ✦
          </div>

          <h1>Ask Atelier AI</h1>

          <p v-if="currentLang === 'id'">
            Tanyakan apa saja tentang karya seni ini dalam Bahasa Indonesia atau English.
          </p>
          <p v-else>
            Ask anything about this artwork in English or Bahasa Indonesia.
          </p>

          <div class="suggestions-container">
            <div class="suggestions-header">
              <span class="suggestions-label">
                {{ currentLang === 'id' ? 'Daftar Pertanyaan' : 'Suggested Questions' }}
              </span>
              <div class="lang-switch-pills">
                <button 
                  type="button"
                  class="lang-pill" 
                  :class="{ active: currentLang === 'id' }" 
                  @click="currentLang = 'id'"
                >
                  ID
                </button>
                <button 
                  type="button"
                  class="lang-pill" 
                  :class="{ active: currentLang === 'en' }" 
                  @click="currentLang = 'en'"
                >
                  EN
                </button>
              </div>
            </div>

            <div class="suggestions-list">
              <button
                v-for="(suggestion, idx) in activeSuggestions"
                :key="idx"
                class="suggestion-item"
                @click="sendMessage(suggestion.text)"
              >
                <div class="suggestion-item-main">
                  <span class="suggestion-badge">{{ suggestion.tag }}</span>
                  <span class="suggestion-title">{{ suggestion.label }}</span>
                </div>
                <span class="suggestion-arrow-icon">→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div v-else class="messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-row"
            :class="message.role"
          >
            <div v-if="message.role === 'assistant'" class="assistant-avatar">
              ✦
            </div>

            <div class="message-bubble">
              <img 
                v-if="message.imageUrl" 
                :src="message.imageUrl" 
                class="message-attached-image"
              />
              <div class="message-text" v-html="cleanContent(message.content)"></div>
            </div>
          </div>

          <div v-if="isLoading" class="message-row assistant">
            <div class="assistant-avatar">
              ✦
            </div>
            <div class="message-bubble loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <!-- Suggestions when artwork is present -->
          <div v-if="messages.length > 0 && messages.length <= 2 && !isLoading" class="suggestions-container inline-suggestions">
            <div class="suggestions-header">
              <span class="suggestions-label">
                {{ currentLang === 'id' ? 'Daftar Pertanyaan' : 'Suggested Questions' }}
              </span>
              <div class="lang-switch-pills">
                <button 
                  type="button"
                  class="lang-pill" 
                  :class="{ active: currentLang === 'id' }" 
                  @click="currentLang = 'id'"
                >
                  ID
                </button>
                <button 
                  type="button"
                  class="lang-pill" 
                  :class="{ active: currentLang === 'en' }" 
                  @click="currentLang = 'en'"
                >
                  EN
                </button>
              </div>
            </div>

            <div class="suggestions-list">
              <button
                v-for="(suggestion, idx) in activeSuggestions"
                :key="'sug-' + idx"
                class="suggestion-item"
                @click="sendMessage(suggestion.text)"
              >
                <div class="suggestion-item-main">
                  <span class="suggestion-badge">{{ suggestion.tag }}</span>
                  <span class="suggestion-title">{{ suggestion.label }}</span>
                </div>
                <span class="suggestion-arrow-icon">→</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <!-- Input -->
    <ion-footer class="chat-footer">
      <div class="input-container">

        <textarea
          v-model="inputMessage"
          class="message-input"
          :placeholder="currentLang === 'id' ? 'Tanyakan dalam Bahasa Indonesia atau English...' : 'Ask in English or Bahasa Indonesia...'"
          rows="1"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="handleEnter"
        />

        <button
          class="send-button"
          :disabled="!inputMessage.trim() || isLoading"
          @click="sendMessage()"
        >
          <ion-icon :icon="sendOutline" />
        </button>

      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonFooter,
  IonIcon
} from '@ionic/vue'

import { sendOutline } from 'ionicons/icons'
import { sendChatMessage } from '@/services/aiService'

interface Message {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

const contentRef = ref<any>(null)
const inputMessage = ref('')
const isLoading = ref(false)
const currentLang = ref<'id' | 'en'>('id')

const messages = ref<Message[]>([])

const artworkDataStr = history.state.artwork
const artworkData = artworkDataStr ? JSON.parse(artworkDataStr as string) : null

const idArtworkSuggestions = [
  { tag: 'TERJEMAHAN', label: 'Terjemahkan deskripsi karya ke Bahasa Indonesia', text: 'Terjemahkan deskripsi karya ini ke Bahasa Indonesia' },
  { tag: 'TERJEMAHAN', label: 'Terjemahkan bio & profil seniman', text: 'Terjemahkan bio dan profil seniman ini ke Bahasa Indonesia' },
  { tag: 'ANALISIS', label: 'Jelaskan makna & latar belakang lukisan', text: 'Jelaskan makna dan latar belakang lukisan ini' },
  { tag: 'INFORMASI', label: 'Tahun berapa & di museum mana diselenggarakan?', text: 'Tahun berapa lukisan ini dibuat dan di museum mana diselenggarakan?' },
  { tag: 'REKOMENDASI', label: 'Rekomendasikan lukisan serupa', text: 'Rekomendasikan lukisan yang serupa dengan karya ini' }
]

const enArtworkSuggestions = [
  { tag: 'ANALYSIS', label: 'Explain the meaning & story of this painting', text: 'Explain the meaning, story, and artistic style of this painting' },
  { tag: 'BIOGRAPHY', label: 'Tell me about the artist\'s biography & history', text: 'Tell me about the artist\'s biography and artistic background' },
  { tag: 'DETAILS', label: 'When was it created & which museum holds it?', text: 'When was this artwork created and in which museum is it located?' },
  { tag: 'RECOMMENDATION', label: 'Recommend similar artworks to this one', text: 'Recommend similar artworks to this painting' },
  { tag: 'TRANSLATION', label: 'Translate full artwork details to Indonesian', text: 'Terjemahkan semua detail karya ini ke Bahasa Indonesia' }
]

const idGeneralSuggestions = [
  { tag: 'ANALISIS', label: 'Bagaimana cara membaca & mengapresiasi lukisan?', text: 'Bagaimana cara membaca dan mengapresiasi sebuah lukisan?' },
  { tag: 'SEJARAH', label: 'Apa perbedaan aliran Impressionism & Renaissance?', text: 'Apa perbedaan antara aliran Impressionism dan Renaissance?' },
  { tag: 'KOLEKSI', label: 'Museum apa saja yang bekerjasama dengan Atelier?', text: 'Museum apa saja yang datanya tersedia di Atelier?' }
]

const enGeneralSuggestions = [
  { tag: 'ANALYSIS', label: 'How do I analyze and appreciate fine art paintings?', text: 'How do I analyze and appreciate fine art paintings?' },
  { tag: 'HISTORY', label: 'What is the difference between Impressionism & Renaissance?', text: 'What is the key difference between Impressionism and Renaissance art?' },
  { tag: 'COLLECTION', label: 'Which museum collections are available in Atelier?', text: 'Which museum collections are available in Atelier?' }
]

const activeSuggestions = computed(() => {
  if (artworkData) {
    return currentLang.value === 'id' ? idArtworkSuggestions : enArtworkSuggestions
  }
  return currentLang.value === 'id' ? idGeneralSuggestions : enGeneralSuggestions
})

function cleanContent(text: string): string {
  if (!text) return ''

  let html = text
    // Replace **bold** with <strong>bold</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Replace *italic* with <em>italic</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Replace newline breaks with <br/>
    .replace(/\n/g, '<br/>')

  return html
}

function scrollToBottom() {
  nextTick(() => {
    if (contentRef.value?.$el?.scrollToBottom) {
      contentRef.value.$el.scrollToBottom(300)
    } else if (contentRef.value?.scrollToBottom) {
      contentRef.value.scrollToBottom(300)
    }
  })
}

onMounted(() => {
  if (artworkData) {
    const sourceMuseum = artworkData._source === 'cleveland' 
      ? 'Cleveland Museum of Art' 
      : artworkData.museum || 'Metropolitan Museum of Art'

    messages.value.push({
      role: 'user',
      content: `Saya sedang melihat karya "${artworkData.title || 'Lukisan ini'}" dari ${sourceMuseum}.`,
      imageUrl: artworkData.image_url
    })
    
    // Auto-reply greeting
    setTimeout(() => {
      messages.value.push({
        role: 'assistant',
        content: `Halo! Saya Atelier AI. Saya dapat menjelaskan makna & deskripsi singkat lukisan ini (berdasarkan data ${sourceMuseum}), menerjemahkan deskripsinya ke Bahasa Indonesia, serta mengulas biografi seniman dan teknik yang digunakan. Anda juga dapat bertanya dalam Bahasa Inggris (English)!`
      })
      scrollToBottom()
    }, 300)
  }
})

async function sendMessage(message?: string) {
  const text = (message ?? inputMessage.value).trim()

  if (!text || isLoading.value) {
    return
  }

  messages.value.push({
    role: 'user',
    content: text
  })

  inputMessage.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const reply = await sendChatMessage(text, artworkData)
    messages.value.push({
      role: 'assistant',
      content: reply || 'Maaf, saya tidak dapat memperoleh tanggapan saat ini.'
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    messages.value.push({
      role: 'assistant',
      content: error?.message || 'Maaf, terjadi kendala saat menghubungi Atelier AI.'
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function handleEnter() {
  sendMessage()
}
</script>

<style src="../theme/chat.css"></style>