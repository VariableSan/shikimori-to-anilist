<script setup lang="ts">
const props = defineProps({
  label: String,
  disabled: Boolean,
})

const emit = defineEmits(["click"])

const onClick = () => {
  if (!props.disabled) {
    emit("click")
  }
}
</script>

<template>
  <button
    class="flex font-bold rounded-2xl h-10 text-white w-max px-4 group relative overflow-hidden items-center"
    :class="{
      'bg-green-500': !disabled,
      'bg-gray-500 text-opacity-50 cursor-not-allowed': disabled,
    }"
    :disabled="disabled"
    @click="onClick"
  >
    <slot name="default">
      <p>{{ label }}</p>
    </slot>

    <div
      v-show="!disabled"
      class="h-full rounded-2xl w-full inset-0 transition-all scale-0 duration-300 absolute group-hover:bg-white/30 group-hover:scale-100"
    ></div>
  </button>
</template>
