<template>
  <ion-page>
    <ion-content :fullscreen="true">

      <div class="login-page" ref="loginPageRef">

        <!-- BACKGROUND -->
        <div class="background">
          <img
            src="/vann.webp"
            alt="Artwork Atelier"
          />

          <div class="overlay"></div>
        </div>


        <!-- LOGO -->
        <div class="logo">
          Atelier
        </div>


        <!-- LEFT CONTENT -->
        <div class="left-content">

          <!-- EYEBROW -->
          <div class="eyebrow">
            <span class="dot"></span>

            <span>CREATIVE SPACE</span>

            <span class="separator">•</span>

            <span>OPEN ACCESS</span>
          </div>


          <!-- HEADLINE -->
          <h1>
            Explore art<br />
            <em>Build your gallery.</em>
          </h1>


          <!-- DESCRIPTION -->
          <p class="description">
            Explore artworks, discover what captures your attention,
            and build your art gallery.
          </p>

        </div>


        <!-- RIGHT CONTENT -->
        <div class="right-content">

          <!-- WELCOME CARD -->
          <div class="login-box">

            <div class="login-heading">

              <span class="small-title">
                ATELIER
              </span>

              <h2>
                Welcome
              </h2>

              <p>
                Explore artworks and build your art gallery
              </p>

            </div>


            <!-- EXPLORE BUTTON -->
            <button
              type="button"
              class="explore-button"
              :disabled="navigating"
              @click="Mulaimenjelajah"
            >
              {{ navigating ? 'Loading...' : 'Start Exploring' }}
            </button>

          </div>

        </div>

      </div>

    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">

import { useRouter } from 'vue-router'
import { ref } from 'vue'

import {
  IonPage,
  IonContent
} from '@ionic/vue'

import '@/theme/login.css'


const router = useRouter()
const loginPageRef = ref<HTMLElement | null>(null)
const navigating = ref(false)


const Mulaimenjelajah = async () => {
  if (navigating.value) return
  navigating.value = true

  const el = loginPageRef.value
  if (el) {
    el.style.transition = 'opacity 0.4s ease'
    el.style.opacity = '0'
    await new Promise(resolve => setTimeout(resolve, 380))
  }

  router.push('/home')
}

</script>