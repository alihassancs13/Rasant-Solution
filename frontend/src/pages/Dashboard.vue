<script setup>


const {
  messages, loading, error, searchQuery, searchInput,
  fetchMessages, deleteMessage, filtered,
  cvSubmissions, cvLoading, cvError, cvSearchQuery,
  fetchCVSubmissions, deleteCV, filteredCVs,
  formatDate, initials, API_BASE, viewCV,
} = useDashboard()
</script>

<template>
  <div>

    <!-- ═══════════════════════════════════════
         CONTACT MESSAGES
    ════════════════════════════════════════ -->
    <div class="max-w-5xl mx-auto p-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-blue-900">Contact Messages</h1>
          <span v-if="!loading" class="bg-orange-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
            {{ filtered.length }}
          </span>
        </div>
        <button
            @click="fetchMessages"
            :disabled="loading"
            class="flex items-center gap-1.5 px-4 py-2 border border-blue-200 rounded-lg bg-white text-blue-700 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <font-awesome-icon
              :icon="loading ? ['fas', 'spinner'] : ['fas', 'arrow-rotate-right']"
              :class="{ 'animate-spin': loading }"
              class="w-[15px] h-[15px]"
          />
          Refresh
        </button>
      </div>

      <!-- Search -->
      <div class="relative mb-6">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email or message..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      <!-- Error -->
      <div v-if="error" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        {{ error }}
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="bg-white border border-gray-100 rounded-2xl p-5 flex gap-3 animate-pulse">
          <div class="w-10 h-10 min-w-[40px] rounded-full bg-gray-200"></div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="h-3 bg-gray-200 rounded w-3/5"></div>
            <div class="h-3 bg-gray-200 rounded w-2/5"></div>
            <div class="h-3 bg-gray-200 rounded w-full mt-1"></div>
            <div class="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center gap-4 py-24 text-gray-400 text-center">
        <font-awesome-icon :icon="['far', 'comment']" class="text-5xl opacity-40" />
        <p class="text-sm">{{ searchQuery ? 'No messages match your search.' : 'No messages yet.' }}</p>
      </div>

      <!-- Message Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
            v-for="msg in filtered" :key="msg.id"
            class="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-orange-200 transition-all duration-200"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 min-w-[40px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold flex items-center justify-center">
              {{ initials(msg.full_name) }}
            </div>
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <span class="font-semibold text-sm text-gray-900 truncate">{{ msg.full_name }}</span>
              <a :href="`mailto:${msg.email}`" class="text-xs text-blue-600 hover:underline truncate">{{ msg.email }}</a>
              <span v-if="msg.phone" class="text-xs text-gray-400">{{ msg.phone }}</span>
            </div>
            <span class="text-[11px] text-gray-400 whitespace-nowrap mt-0.5 shrink-0">
              {{ formatDate(msg.created_at) }}
            </span>
          </div>

          <p class="text-sm text-gray-600 leading-relaxed line-clamp-4 m-0">{{ msg.message }}</p>

          <div class="flex gap-2 border-t border-gray-100 pt-3 mt-auto">
            <a :href="`mailto:${msg.email}`"
               class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors no-underline">
              <font-awesome-icon :icon="['fas', 'envelope']" />
              Reply
            </a>
            <button @click="deleteMessage(msg.id)"
                    class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
              <font-awesome-icon :icon="['fas', 'trash']" />
              Delete
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════
         CV SUBMISSIONS
    ════════════════════════════════════════ -->
    <div class="max-w-5xl mx-auto p-8 border-t border-gray-100">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-blue-900">CV Submissions</h1>
          <span v-if="!cvLoading" class="bg-blue-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
            {{ filteredCVs.length }}
          </span>
        </div>
        <button
            @click="fetchCVSubmissions"
            :disabled="cvLoading"
            class="flex items-center gap-1.5 px-4 py-2 border border-blue-200 rounded-lg bg-white text-blue-700 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <font-awesome-icon
              :icon="cvLoading ? ['fas', 'spinner'] : ['fas', 'arrow-rotate-right']"
              :class="{ 'animate-spin': cvLoading }"
              class="w-[15px] h-[15px]"
          />
          Refresh
        </button>
      </div>

      <!-- Search -->
      <div class="relative mb-6">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
            v-model="cvSearchQuery"
            type="text"
            placeholder="Search by name, email or position..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      <!-- Error -->
      <div v-if="cvError" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        {{ cvError }}
      </div>

      <!-- Skeleton -->
      <div v-if="cvLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="bg-white border border-gray-100 rounded-2xl p-5 flex gap-3 animate-pulse">
          <div class="w-10 h-10 min-w-[40px] rounded-full bg-gray-200"></div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="h-3 bg-gray-200 rounded w-3/5"></div>
            <div class="h-3 bg-gray-200 rounded w-2/5"></div>
            <div class="h-3 bg-gray-200 rounded w-full mt-1"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCVs.length === 0" class="flex flex-col items-center gap-4 py-24 text-gray-400 text-center">
        <font-awesome-icon :icon="['fas', 'file-lines']" class="text-5xl opacity-40" />
        <p class="text-sm">{{ cvSearchQuery ? 'No CVs match your search.' : 'No CV submissions yet.' }}</p>
      </div>

      <!-- CV Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
            v-for="cv in filteredCVs" :key="cv.id"
            class="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all duration-200"
        >
          <!-- Top -->
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 min-w-[40px] rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold flex items-center justify-center">
              {{ initials(cv.full_name) }}
            </div>
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <span class="font-semibold text-sm text-gray-900 truncate">{{ cv.full_name }}</span>
              <a :href="`mailto:${cv.email}`" class="text-xs text-blue-600 hover:underline truncate">{{ cv.email }}</a>
              <span class="text-xs text-gray-400">{{ cv.phone }}</span>
            </div>
            <span class="text-[11px] text-gray-400 whitespace-nowrap mt-0.5 shrink-0">
              {{ formatDate(cv.submitted_at) }}
            </span>
          </div>

          <!-- Position Badge -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 w-fit">
            <font-awesome-icon :icon="['fas', 'briefcase']" class="text-[11px]" />
            {{ cv.desired_position }}
          </span>

          <!-- Cover Letter -->
          <p v-if="cv.cover_letter" class="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {{ cv.cover_letter }}
          </p>
          <p v-else class="text-xs text-gray-400 italic">No cover letter provided.</p>

          <!-- Actions -->
          <div class="flex gap-2 border-t border-gray-100 pt-3 mt-auto">
            <button
                @click="viewCV(cv)"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'eye']" />
              View CV
            </button>
            <button
                @click="deleteCV(cv.id)"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
              Delete
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>