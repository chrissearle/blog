<script setup lang="ts">
useFeed("/feed.xml", "Chris Searle")
</script>

<template>
  <UApp>
    <NavBar />

    <main class="flex-1">
      <NuxtPage />
    </main>

    <NavFooter />
  </UApp>
</template>
