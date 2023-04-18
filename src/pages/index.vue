<script setup lang="ts">
defineOptions({
  name: "IndexPage",
})

const { t } = useI18n()
</script>

<template>
  <div class="ccontainer">
    {{ t("hello") }}
  </div>
</template>
