<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonRouterOutlet
} from '@ionic/vue'

import { onMounted } from 'vue'
import { initDatabase } from '@/database/database'

onMounted(async () => {
  try {
    await initDatabase()

    console.log('Database Atelier berhasil diinisialisasi')
  } catch (error) {
    console.error(
      'Database Atelier gagal diinisialisasi:',
      error
    )
  }
})
</script>