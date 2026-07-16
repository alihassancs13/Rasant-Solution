<!-- pages/admin/Documents/documents.vue -->
<template>
  <div class="flex h-screen overflow-hidden">
    <AdminSidebar />
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
            class="w-full"
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Documents"
            subtitleOverride="Files, folders & shared storage"
        />
      </div>

      <div class="flex-1 pt-1 px-4 pb-4 sm:px-6 lg:px-8 overflow-hidden">
        <div class="w-full">
          <!-- Loading -->
          <div v-if="loading" class="text-center py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p class="text-sm text-gray-500 mt-2">Loading...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {{ error }}
            <button @click="navigateToRoot" class="ml-2 text-blue-600 hover:underline">Try again</button>
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Toolbar -->
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <div class="relative new-menu-container" @click.self="showNewMenu = false">
                <button @click.stop="toggleNewMenu" class="tab-active-gradient hover:bg-blue-700 cursor-pointer text-buttonTextColor px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-2">
                  <i class="fas fa-plus"></i>
                  <span>New</span>
                </button>
                <div v-if="showNewMenu" class="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-48 sm:w-56 z-10 py-1">
                  <button @click="openFolderModal" class="w-full px-3 sm:px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-xs sm:text-sm">
                    <span class="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                      <i class="fas fa-folder-plus text-xs sm:text-sm"></i>
                    </span>
                    <div class="text-left">
                      <div class="font-medium">Create folder</div>
                      <div class="text-[10px] sm:text-xs text-gray-500">Empty folder in this location</div>
                    </div>
                  </button>
                  <button @click="uploadFile" class="w-full px-3 sm:px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-xs sm:text-sm border-t border-gray-100">
                    <span class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <i class="fas fa-file-circle-plus text-xs sm:text-sm"></i>
                    </span>
                    <div class="text-left">
                      <div class="font-medium">Create file</div>
                      <div class="text-[10px] sm:text-xs text-gray-500">Upload documents & media</div>
                    </div>
                  </button>
                  <button @click="uploadZip" class="w-full px-3 sm:px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-xs sm:text-sm border-t border-gray-100">
                    <span class="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      <i class="fas fa-file-zipper text-xs sm:text-sm"></i>
                    </span>
                    <div class="text-left">
                      <div class="font-medium">Zip</div>
                      <div class="text-[10px] sm:text-xs text-gray-500">Upload .zip / .rar archives</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                <button v-for="filter in filters" :key="filter.value" @click="currentFilter = filter.value"
                        class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-sm rounded-md transition"
                        :class="currentFilter === filter.value ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:text-gray-800'">
                  {{ filter.label }}
                </button>
              </div>

              <div class="flex-1 min-w-[100px] sm:min-w-[150px] relative">
                <i class="fas fa-search absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] sm:text-sm"></i>
                <input v-model="searchQuery" type="search" placeholder="Search documents..."
                       class="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <select v-model="sortBy" class="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="name">Sort: Name</option>
                <option value="newest">Sort: Newest</option>
                <option value="size">Sort: Size</option>
              </select>

              <div class="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                <button @click="viewMode = 'grid'" class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md transition"
                        :class="viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:text-gray-800'">
                  <i class="fas fa-table-cells-large text-xs sm:text-sm"></i>
                </button>
                <button @click="viewMode = 'list'" class="hidden sm:block px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md transition"
                        :class="viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:text-gray-800'">
                  <i class="fas fa-list text-xs sm:text-sm"></i>
                </button>
              </div>

              <input type="file" ref="fileInput" @change="handleFileUpload" multiple hidden />
              <input type="file" ref="zipInput" @change="handleZipUpload" accept=".zip,.rar,.7zip" multiple hidden />
            </div>

            <!-- Breadcrumb - Hide when in All/Folders/Files view -->
            <div v-if="isFolderView" class="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-600 mb-4 py-1 border-b border-gray-100">
              <nav class="flex flex-wrap items-center gap-1 sm:gap-2">
                <button @click="navigateToRoot" class="hover:text-blue-600" title="Go to root">
                  <i class="fas fa-home"></i>
                </button>
                <button @click="goBack" class="hover:text-blue-600 ml-2" title="Go back">
                  <i class="fas fa-arrow-left"></i>
                </button>
                <span v-for="(folder, index) in breadcrumb" :key="folder.id" class="flex items-center gap-1 sm:gap-2">
                    <span class="text-gray-300">/</span>
                    <button @click="navigateTo(folder.id)" class="hover:text-blue-600 text-xs sm:text-sm"
                            :class="index === breadcrumb.length - 1 ? 'text-gray-800 font-medium' : ''">
                      {{ folder.name }}
                    </button>
                  </span>
                            </nav>
                            <span class="text-[10px] sm:text-xs text-gray-400">{{ filteredItems.length }} items</span>
                          </div>

                <!-- Dropzone -->
            <div class="relative border-2 border-dashed rounded-xl transition-all flex-1 min-h-[480px]"
                 :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'"
                 @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">

              <!-- GRID VIEW -->
              <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 p-3 sm:p-4">
                <div v-for="item in filteredItems" :key="item.id" @click="!item.isFolder ? viewFile(item) : null" @dblclick="openItem(item)"
                     class="group relative bg-gray-50 hover:bg-gray-100 rounded-xl p-3 sm:p-4 text-center transition cursor-pointer border-2 border-transparent hover:border-blue-200">
                  <div class="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition flex gap-0.5 sm:gap-1">
                    <button @click.stop="editItem(item)" class="w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full shadow hover:bg-gray-50 text-[8px] sm:text-xs text-gray-600">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button @click.stop="deleteItem(item)" class="w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full shadow hover:bg-red-50 text-[8px] sm:text-xs text-red-500">
                      <i class="fas fa-trash-can"></i>
                    </button>
                  </div>
                  <div class="text-3xl sm:text-4xl mb-1 sm:mb-2" :class="item.isFolder ? 'text-yellow-500' : 'text-blue-500'">
                    <i :class="item.isFolder ? 'fas fa-folder' : getFileIcon(item.extension)"></i>
                  </div>
                  <div class="text-xs sm:text-sm font-medium text-gray-800 truncate">{{ item.name }}</div>
                  <div class="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                    <span v-if="item.isFolder">{{ item.children_count || 0 }} items</span>
                    <span v-else>{{ formatFileSize(item.size) }}</span>
                  </div>
                  <div class="text-[8px] sm:text-xs text-gray-300 mt-0.5">{{ formatDate(item.created_at) }}</div>
                </div>
              </div>
              <!-- LIST VIEW - Split Layout -->
              <div v-else class="flex flex-col sm:flex-row gap-3 h-[calc(112vh-330px)] overflow-hidden">
                <!-- Left Side: File List - Fixed width -->
                <div class="w-full sm:w-2/5 lg:w-1/5 overflow-y-auto" style="height: 100%;">
                <table class="w-full text-xs sm:text-sm">
                    <thead class="bg-gray-50 text-gray-600 sticky top-0 z-10">
                    <tr>
                      <th class="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in filteredItems" :key="item.id"
                        @click="!item.isFolder ? handleListClick(item) : null"
                        @dblclick="openItem(item)"
                        class="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                        :class="!item.isFolder && selectedFileId === item.id && showPreview ? 'bg-blue-50' : ''">
                      <td class="px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-1 sm:gap-2">
                        <i :class="item.isFolder ? 'fas fa-folder text-yellow-500' : getFileIcon(item.extension)" class="text-base sm:text-lg"></i>
                        <span class="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">{{ item.name }}</span>
                                <span v-if="!item.isFolder && selectedFileId === item.id && showPreview" class="text-[10px] text-blue-500 ml-1">
                      <i class="fas fa-eye"></i>
                    </span>
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </div>

                <!-- Right Side: Preview Panel - Takes remaining width -->
                <div class="w-full sm:w-3/5 lg:w-1/1" style="height: 100%; overflow: hidden;">
                  <div v-if="showPreview && previewData" class="bg-white rounded-xl border border-gray-200 flex flex-col" style="height: 100%;">
                    <!-- Preview Header with Action Icons -->
                    <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl shrink-0">
                      <div class="flex items-center gap-2 min-w-0">
                        <i :class="getFileIcon(previewData.extension)" class="text-lg"></i>
                        <span class="font-medium text-sm text-gray-800 truncate">{{ previewData.name }}</span>
                        <span class="text-xs text-gray-400 whitespace-nowrap">{{ previewData.size }}</span>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <!-- Delete Icon -->
                        <button @click.stop="deleteItem(getCurrentFile())"
                                class="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                        <!-- Download Icon -->
                        <button @click.stop="downloadFile(getCurrentFile())"
                                class="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                title="Download">
                          <i class="fas fa-download"></i>
                        </button>
                        <!-- Close Icon -->
                        <button @click.stop="closePreview"
                                class="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                title="Close">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Preview Content -->
                    <div class="flex-1 p-4" style="overflow: hidden;">
                      <div v-if="previewLoading" class="flex items-center justify-center h-full">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                        <span class="ml-2 text-sm text-gray-500">Loading preview...</span>
                      </div>
                      <div v-else-if="previewError" class="flex flex-col items-center justify-center h-full text-red-500">
                        <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                        <p>{{ previewError }}</p>
                      </div>
                      <div v-else class="h-full">
                        <!-- Text Preview -->
                        <div v-if="previewData.type === 'text'" class="h-full overflow-y-auto">
                          <pre class="text-sm font-mono whitespace-pre-wrap">{{ previewData.content }}</pre>
                        </div>
                        <!-- PDF Preview -->
                        <div v-else-if="previewData.type === 'pdf'" class="h-full">
                          <iframe v-if="previewData.blob_url"
                                  :src="previewData.blob_url"
                                  class="w-full h-full"
                                  style="border: none; min-height: 400px;"
                                  allowfullscreen>
                          </iframe>
                          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
                            <i class="fas fa-file-pdf text-5xl mb-2"></i>
                            <p>PDF preview not available</p>
                          </div>
                        </div>
                        <!-- Image Preview -->
                        <div v-else-if="previewData.type === 'image'" class="flex justify-center items-center h-full">
                          <img :src="previewData.content" :alt="previewData.name" class="max-w-full max-h-full object-contain" />
                        </div>
                        <!-- Video Preview -->
                        <div v-else-if="previewData.type === 'video'" class="flex justify-center items-center h-full">
                          <video controls class="max-w-full max-h-full">
                            <source :src="'data:' + previewData.mime_type + ';base64,' + previewData.content" :type="previewData.mime_type">
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <!-- Audio Preview -->
                        <div v-else-if="previewData.type === 'audio'" class="flex flex-col items-center justify-center h-full">
                          <i class="fas fa-music text-5xl text-purple-500 mb-4"></i>
                          <p class="text-sm text-gray-600 mb-4">{{ previewData.name }}</p>
                          <audio controls class="w-full max-w-md">
                            <source :src="'data:' + previewData.mime_type + ';base64,' + previewData.content" :type="previewData.mime_type">
                            Your browser does not support the audio tag.
                          </audio>
                        </div>
                        <!-- Unsupported -->
                        <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
                          <i class="fas fa-file text-5xl mb-2"></i>
                          <p>Preview not available for this file type</p>
                          <button @click.stop="downloadFile(getCurrentFile())" class="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                            <i class="fas fa-download"></i> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Empty Preview State -->
                  <div v-else class="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400" style="height: 100%; min-height: 300px;">
                    <i class="fas fa-file text-5xl mb-3"></i>
                    <p class="text-sm">Select a file to preview</p>
                    <p class="text-xs mt-1">Click on any file in the list</p>
                  </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-if="filteredItems.length === 0" class="py-12 sm:py-16 text-center">
                  <div class="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4">
                  <i class="fas fa-cloud-arrow-up"></i>
                </div>
                <h4 class="text-base sm:text-lg font-medium text-gray-700">
                  {{ isFolderView ? 'This folder is empty' : 'No items found' }}
                </h4>
                <p class="text-xs sm:text-sm text-gray-400 mt-1 px-4">
                  {{ isFolderView
                    ? 'Drag & drop files here, or use the New button to upload documents or create a folder.'
                    : 'No documents found in this view.'
                  }}
                </p>
                </div>

                <div v-if="isDragging" class="absolute inset-0 bg-blue-50/90 rounded-xl flex flex-col items-center justify-center z-10">
                <i class="fas fa-cloud-arrow-up text-4xl sm:text-5xl text-blue-500 mb-2 sm:mb-3"></i>
                <p class="text-base sm:text-lg font-medium text-gray-700">Drop to upload</p>
                <span class="text-xs sm:text-sm text-gray-500">Files will be added to the current folder</span>
                </div>
                </div>

              <div class="text-[10px] sm:text-xs text-gray-400 mt-3 flex flex-wrap items-center gap-1">
              <i class="fas fa-hand-pointer"></i>
              <span>Hover a card for quick actions · double-click folders to open .</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ===== CREATE FOLDER MODAL ===== -->
    <BaseModal
        :is-open="showFolderModal"
        mode="form"
        title="Create New Folder"
        subtitle="Enter a name for your new folder"
        submit-text="Create Folder"
        cancel-text="Cancel"
        :loading="isSubmitting"
        @close="closeFolderModal"
        @save="submitFolder"
    >
      <div class="space-y-4">
        <div>
          <label for="folderName" class="block text-sm font-medium text-gray-700 mb-1">
            Folder Name
          </label>
          <input
              id="folderName"
              v-model="folderName"
              type="text"
              placeholder="Enter folder name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="submitFolder"
              autofocus
          />
          <p class="text-xs text-gray-400 mt-1">
            Will be created in: <span class="font-medium">{{ currentFolderName || 'Root' }}</span>
          </p>
        </div>
      </div>
    </BaseModal>

    <!-- ===== EDIT FOLDER MODAL ===== -->
    <BaseModal
        :is-open="showEditModal"
        mode="form"
        title="Rename Folder"
        subtitle="Enter a new name for this folder"
        submit-text="Save Changes"
        cancel-text="Cancel"
        :loading="isEditing"
        @close="closeEditModal"
        @save="submitEdit"
    >
      <div class="space-y-4">
        <div>
          <label for="editFolderName" class="block text-sm font-medium text-gray-700 mb-1">
            Folder Name
          </label>
          <input
              id="editFolderName"
              v-model="editFolderName"
              type="text"
              placeholder="Enter new folder name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="submitEdit"
              autofocus
          />
        </div>
      </div>
    </BaseModal>

    <!-- ===== DELETE MODAL ===== -->
    <BaseModal
        :is-open="showDeleteModal"
        mode="delete"
        title="Delete Item"
        :subtitle="deleteSubtitle"
        submit-text="Delete"
        cancel-text="Cancel"
        :loading="isDeleting"
        @close="closeDeleteModal"
        @save="submitDelete"
    />
  </div>
</template>

<script>
import useDocuments from '@/composables/useDocuments.js'
import AdminSidebar from "@/components/adminSidebar.vue";
import DashboardHeader from '@/components/header.vue';
import BaseModal from '@/components/baseModal.vue';
export default {
  name: 'Documents',
  components: {
    AdminSidebar,
    DashboardHeader,
    BaseModal
  },
  setup() {
    return useDocuments()
  }

}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Preview content scroll */
.preview-content {
  max-height: 400px;
  overflow-y: auto;
}

.preview-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.preview-content::-webkit-scrollbar-track {
  background: transparent;
}
.preview-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 9999px;
}
.preview-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>