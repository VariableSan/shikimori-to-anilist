<script setup lang="ts">
defineProps({
  label: String,
  disabled: Boolean,
})

const emit = defineEmits(["click"])

const onClick = () => {
  emit("click")
}
</script>

<template>
  <button
    class="flex font-bold bg-green-500 rounded-2xl h-10 text-white w-max px-4 group relative overflow-hidden items-center"
    :disabled="disabled"
    @click="onClick"
  >
    <slot name="default">
      <p>{{ label }}</p>
    </slot>

    <div
      class="h-full rounded-2xl w-full inset-0 transition-all scale-0 duration-300 absolute group-hover:bg-white/30 group-hover:scale-100"
    ></div>
  </button>
</template>
