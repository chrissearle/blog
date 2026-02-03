<template>
  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
      @click="close"
    ></div>
  </Transition>

  <!-- Lightbox Content -->
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      @click.self="close"
    >
      <!-- Close button -->
      <button
        type="button"
        class="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close lightbox"
        @click="close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Image container -->
      <div class="relative max-h-[90vh] max-w-[90vw] flex flex-col">
        <div class="flex-1 flex items-center justify-center overflow-hidden">
          <NuxtImg
            :src="src"
            :alt="alt"
            class="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            loading="eager"
          />
        </div>

        <!-- Caption -->
        <div
          v-if="alt"
          class="mt-4 rounded-lg bg-black/50 px-4 py-3 text-center backdrop-blur-sm"
        >
          <p class="text-sm md:text-base text-white">
            {{ alt }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string
  alt: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

// Close on ESC key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      close()
    }
  }

  window.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})

// Prevent body scroll when open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
