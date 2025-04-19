<template>
  <div
    class="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
  >
    <div class="flex justify-between items-start mb-2">
      <span :class="priorityBadgeClass">{{ priorityText }}</span>
      <span class="text-sm text-gray-500">{{ dueDate }}</span>
    </div>
    <h3 class="font-semibold text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-600 mb-4">{{ description }}</p>
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <span
          class="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
        >
          {{ subject }}
        </span>
      </div>
      <div class="flex items-center">
        <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
          <div
            class="bg-indigo-600 h-2 rounded-full"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <span class="text-xs text-gray-600">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: String, required: true },
  priority: { type: String, required: true },
  subject: { type: String, required: true },
  progress: { type: Number, required: true },
});

const priorityBadgeClass = computed(() => {
  switch (props.priority) {
    case "high":
      return "px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800";
    case "medium":
      return "px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800";
    case "low":
      return "px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800";
    default:
      return "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800";
  }
});

const priorityText = computed(() => {
  switch (props.priority) {
    case "high":
      return "Высокий";
    case "medium":
      return "Средний";
    case "low":
      return "Низкий";
    default:
      return "Обычный";
  }
});
</script>
