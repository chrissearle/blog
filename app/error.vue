<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps<{ error: NuxtError }>()

useHead({
  title: `${props.error.statusCode} ${props.error.statusMessage ?? ""}`,
})
</script>

<template>
  <UApp>
    <NavBar />

    <main class="flex-1">
      <UContainer class="pb-12">
        <UError :error="error" redirect="/" />
      </UContainer>
    </main>

    <NavFooter />
  </UApp>
</template>
