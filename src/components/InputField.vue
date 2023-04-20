<script setup lang="ts">
const props = defineProps({
  label: String,
  modelValue: String,
})

const emit = defineEmits(["update:modelValue"])

const innerModel = computed({
  get: () => props.modelValue,
  set(v) {
    emit("update:modelValue", v)
  },
})
</script>

<template>
  <div>
    <label
      :for="`${label}-labelFor`"
      class="font-medium text-sm mb-2 text-gray-900 block dark:text-gray-300"
    >
      {{ label }}
    </label>
    <input
      v-model="innerModel"
      :id="`${label}-labelFor`"
      type="text"
      class="border rounded-lg bg-gray-50 border-gray-300 text-sm w-full p-2.5 text-gray-900 block dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500"
    />
  </div>
</template>
