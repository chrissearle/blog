<script setup lang="ts">
const config = useRuntimeConfig()
const imageTag = computed(() => config.public.imageTag || "development")
</script>

<template>
  <UContainer>
    <Head>
      <Title>Version</Title>
    </Head>

    <h3 class="pageTitle">Version</h3>

    <p>{{ imageTag }}</p>
  </UContainer>
</template>
