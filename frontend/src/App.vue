<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :max="12">
      <component
        :is="Component"
        v-if="shouldKeepAlive(route)"
        :key="route.name || route.path"
      />
    </keep-alive>
    <component
      :is="Component"
      v-if="!shouldKeepAlive(route)"
      :key="route.fullPath"
    />
  </router-view>
  <ToastContainer />
</template>
<script setup>
import ToastContainer from '@/components/ToastContainer.vue'

/** Cache admin/employee module pages so revisiting them does not remount + refetch. */
function shouldKeepAlive(route) {
  const path = route?.path || ''
  if (route?.meta?.keepAlive === false) return false
  if (route?.meta?.keepAlive === true) return true
  return path.startsWith('/admin') || path.startsWith('/employee')
}
</script>
