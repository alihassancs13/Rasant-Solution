// stores/documentStore.js
import { defineStore } from 'pinia';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const getAuthToken = () => localStorage.getItem('accessToken');

export const useDocumentStore = defineStore('documents', {
    state: () => ({
        allItems: [],
        viewItems: [],
        currentFolderId: null,
        isLoading: false,
        error: null,
        storageUsed: '0 MB',
        storagePercentage: 0,
    }),

    getters: {
        getItems: (state) => state.viewItems,
        getFolders: (state) => state.viewItems.filter(item => item.isFolder),
        getFiles: (state) => state.viewItems.filter(item => !item.isFolder),
        folderCount: (state) => state.viewItems.filter(item => item.isFolder).length,
        fileCount: (state) => state.viewItems.filter(item => !item.isFolder).length,
        getCurrentFolderId: (state) => state.currentFolderId,
    },

    actions: {
        // Helper: API request
        async _apiRequest(endpoint, options = {}) {
            const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
            let endpointPath = endpoint;
            if (!endpointPath.startsWith('/')) endpointPath = `/${endpointPath}`;
            const fullUrl = `${cleanedBaseUrl}${endpointPath}`;

            const token = getAuthToken();
            const isFormData = options.isFormData || false;

            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            if (!isFormData) headers['Content-Type'] = 'application/json';

            const requestOptions = {
                ...options,
                headers,
            };
            delete requestOptions.isFormData;

            const response = await fetch(fullUrl, requestOptions);

            if (!response.ok) {
                let errorMessage = 'Request failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorData.detail || 'Request failed';
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            return response.json();
        },

        async loadAllItems() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await this._apiRequest(API_ENDPOINTS.DOCUMENTS.ALL);
                console.log('All items response:', response);

                let folders = [];
                let files = [];

                if (response.folders && Array.isArray(response.folders)) {
                    folders = response.folders;
                }

                if (response.files && Array.isArray(response.files)) {
                    files = response.files;
                }

                const foldersData = folders.map(f => ({
                    ...f,
                    isFolder: true,
                    type: 'folder',
                    children_count: f.children_count || 0,
                    parent_id: f.parent || f.parent_id || null  // CRITICAL: Set parent_id
                }));

                const filesData = files.map(f => ({
                    ...f,
                    isFolder: false,
                    type: 'file',
                    folder_id: f.folder_id || null
                }));

                this.allItems = [...foldersData, ...filesData];
                this.viewItems = [...foldersData, ...filesData];
                this.currentFolderId = null;

                console.log('All items loaded - Folders:', foldersData.map(f => ({
                    id: f.id,
                    name: f.name,
                    parent_id: f.parent_id
                })));

            } catch (error) {
                this.error = error.message;
                console.error('Load all items error:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async loadAllFolders() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await this._apiRequest(API_ENDPOINTS.DOCUMENTS.FOLDERS.ALL);
                console.log('All folders response:', response);
                let data = [];
                if (response.data && Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.folders && Array.isArray(response.folders)) {
                    data = response.folders;
                } else if (Array.isArray(response)) {
                    data = response;
                } else if (response.results && Array.isArray(response.results)) {
                    data = response.results;
                }

                this.viewItems = data.map(f => ({
                    ...f,
                    isFolder: true,
                    type: 'folder',
                    children_count: f.children_count || 0
                }));
                this.currentFolderId = null;
            } catch (error) {
                this.error = error.message;
                console.error('Load all folders error:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async loadAllFiles() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await this._apiRequest(API_ENDPOINTS.DOCUMENTS.FILES.ALL);
                console.log('All files response:', response);
                let data = [];
                if (response.data && Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.files && Array.isArray(response.files)) {
                    data = response.files;
                } else if (Array.isArray(response)) {
                    data = response;
                } else if (response.results && Array.isArray(response.results)) {
                    data = response.results;
                }

                this.viewItems = data.map(f => ({
                    ...f,
                    isFolder: false,
                    type: 'file'
                }));
                this.currentFolderId = null;
            } catch (error) {
                this.error = error.message;
                console.error('Load all files error:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async loadFolderContents(folderId) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await this._apiRequest(
                    API_ENDPOINTS.DOCUMENTS.FOLDERS.CONTENTS(folderId)
                );
                console.log('Folder contents response:', response);
                const currentFolder = response.folder || response.current_folder || null;
                if (currentFolder) {
                    const exists = this.allItems.some(item => item.id === currentFolder.id && item.isFolder);
                    if (!exists) {
                        this.allItems.push({
                            ...currentFolder,
                            isFolder: true,
                            type: 'folder',
                            parent_id: currentFolder.parent || null
                        });
                        console.log('Added current folder to allItems:', currentFolder.name, 'ID:', currentFolder.id, 'Parent:', currentFolder.parent);
                    } else {
                        const existing = this.allItems.find(item => item.id === currentFolder.id && item.isFolder);
                        if (existing) {
                            existing.parent_id = currentFolder.parent || null;
                        }
                    }
                }
                const folders = (response.subfolders || []).map(f => ({
                    ...f,
                    isFolder: true,
                    type: 'folder',
                    children_count: f.children_count || 0,
                    parent_id: f.parent || f.parent_id || folderId  // Set parent_id to current folder
                }));
                folders.forEach(folder => {
                    const exists = this.allItems.some(item => item.id === folder.id && item.isFolder);
                    if (!exists) {
                        this.allItems.push(folder);
                        console.log('Added subfolder to allItems:', folder.name, 'ID:', folder.id, 'Parent:', folder.parent_id);
                    } else {
                        const existing = this.allItems.find(item => item.id === folder.id && item.isFolder);
                        if (existing) {
                            existing.parent_id = folder.parent_id;
                            console.log('Updated subfolder in allItems:', folder.name, 'ID:', folder.id, 'Parent:', folder.parent_id);
                        }
                    }
                });
                const files = (response.files || []).map(f => ({
                    ...f,
                    isFolder: false,
                    type: 'file',
                    folder_id: f.folder_id || folderId
                }));

                this.viewItems = [...folders, ...files];
                this.currentFolderId = folderId;
                console.log('=== ALL FOLDERS IN ALLITEMS ===');
                this.allItems.filter(item => item.isFolder).forEach(f => {
                    console.log(`ID: ${f.id}, Name: ${f.name}, Parent: ${f.parent_id}`);
                });
                console.log('===============================');

            } catch (error) {
                this.error = error.message;
                console.error('Load folder contents error:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async createFolder(name, parentId = null) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await this._apiRequest(
                    API_ENDPOINTS.DOCUMENTS.FOLDERS.CREATE,
                    {
                        method: 'POST',
                        body: JSON.stringify({ name, parent: parentId }),
                    }
                );

                const newFolder = {
                    ...response.data,
                    isFolder: true,
                    type: 'folder',
                    children_count: 0
                };

                this.allItems.push(newFolder);
                this.viewItems.push(newFolder);
                return newFolder;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async uploadFile(folderId, file) {
            if (!folderId) {
                throw new Error('Please select a folder first');
            }

            this.isLoading = true;
            this.error = null;
            try {
                const formData = new FormData();
                formData.append('folder_id', folderId);
                formData.append('file', file);

                const response = await this._apiRequest(
                    API_ENDPOINTS.DOCUMENTS.FILES.UPLOAD,
                    {
                        method: 'POST',
                        body: formData,
                        isFormData: true,
                    }
                );
                const newFile = {
                    ...response.data,
                    isFolder: false,
                    type: 'file'
                };
                this.allItems.push(newFile);
                if (this.currentFolderId === folderId) {
                    this.viewItems.push(newFile);
                }
                const folderInAll = this.allItems.find(item => item.id === folderId && item.isFolder);
                if (folderInAll) {
                    folderInAll.children_count = (folderInAll.children_count || 0) + 1;
                }
                const folderInView = this.viewItems.find(item => item.id === folderId && item.isFolder);
                if (folderInView) {
                    folderInView.children_count = (folderInView.children_count || 0) + 1;
                }

                return newFile;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async updateFolder(folderId, name) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await this._apiRequest(
                    API_ENDPOINTS.DOCUMENTS.FOLDERS.UPDATE(folderId),
                    {
                        method: 'PUT',
                        body: JSON.stringify({ name }),
                    }
                );

                const foundInAll = this.allItems.find(i => i.id === folderId);
                if (foundInAll) foundInAll.name = name;

                const foundInView = this.viewItems.find(i => i.id === folderId);
                if (foundInView) foundInView.name = name;

                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteItem(item) {
            this.isLoading = true;
            this.error = null;
            try {
                const folderId = item.isFolder ? null : item.folder_id;

                if (item.isFolder) {
                    await this._apiRequest(
                        API_ENDPOINTS.DOCUMENTS.FOLDERS.DELETE(item.id),
                        { method: 'DELETE' }
                    );
                } else {
                    await this._apiRequest(
                        API_ENDPOINTS.DOCUMENTS.FILES.DELETE(item.id),
                        { method: 'DELETE' }
                    );
                }
                const allIndex = this.allItems.findIndex(i => i.id === item.id);
                if (allIndex !== -1) {
                    this.allItems.splice(allIndex, 1);
                }
                const viewIndex = this.viewItems.findIndex(i => i.id === item.id);
                if (viewIndex !== -1) {
                    this.viewItems.splice(viewIndex, 1);
                }
                if (!item.isFolder && folderId) {
                    const folderInAll = this.allItems.find(f => f.id === folderId && f.isFolder);
                    if (folderInAll) {
                        folderInAll.children_count = Math.max(0, (folderInAll.children_count || 0) - 1);
                    }

                    const folderInView = this.viewItems.find(f => f.id === folderId && f.isFolder);
                    if (folderInView) {
                        folderInView.children_count = Math.max(0, (folderInView.children_count || 0) - 1);
                    }
                }

            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async shareDocument(folderId, fileId, employeeIds) {
            this.isLoading = true;
            this.error = null;
            try {
                const payload = {
                    employee_id: employeeIds
                };

                if (folderId) {
                    payload.folder_id = folderId;
                } else if (fileId) {
                    payload.file_id = fileId;
                } else {
                    throw new Error('Either folder_id or file_id is required');
                }

                const response = await this._apiRequest(
                    API_ENDPOINTS.DOCUMENTS.SHARE,
                    {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    }
                );
                return response;
            } catch (error) {
                this.error = error.message;
                console.error('Share document error:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        ///view file

        async viewFileContent(fileId) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await this._apiRequest(
                    API_ENDPOINTS.DOCUMENTS.FILES.VIEW(fileId)
                );
                console.log('View file content response:', response);

                if (response.error) {
                    throw new Error(response.error);
                }

                const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                const token = localStorage.getItem('accessToken');

                // Add download URL
                if (!response.download_url) {
                    response.download_url = `${cleanedBaseUrl}/api/documents/files/${fileId}/download/`;
                }

                // For PDFs, create blob URL
                if (response.type === 'pdf' && response.content) {
                    try {
                        const binaryString = atob(response.content);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: 'application/pdf' });
                        response.blob_url = URL.createObjectURL(blob);
                        console.log('PDF blob URL created successfully');
                    } catch (error) {
                        console.error('Error creating PDF blob:', error);
                        response.data_uri = `data:application/pdf;base64,${response.content}`;
                    }
                }

                // For Office documents (Word, Excel, PowerPoint) - create blob URL
                if (response.type === 'office' && response.content) {
                    try {
                        const binaryString = atob(response.content);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: response.mime_type || 'application/octet-stream' });
                        response.blob_url = URL.createObjectURL(blob);
                        console.log('Office document blob URL created successfully');

                        // Create a viewer URL using Microsoft Office Online
                        // This will display Word, Excel, PowerPoint files in the browser
                        const encodedUrl = encodeURIComponent(response.blob_url);
                        response.viewer_url = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
                    } catch (error) {
                        console.error('Error creating office document blob:', error);
                        // Fallback: try Google Docs Viewer with download URL
                        const downloadUrl = response.download_url;
                        const encodedDownloadUrl = encodeURIComponent(downloadUrl);
                        response.viewer_url = `https://docs.google.com/gview?url=${encodedDownloadUrl}&embedded=true`;
                    }
                }

                // For Word/Excel/PowerPoint documents (backward compatibility)
                if (response.type === 'url' && response.url) {
                    // Try to use Google Docs Viewer
                    const downloadUrl = response.download_url || `${cleanedBaseUrl}/api/documents/files/${fileId}/download/`;
                    const encodedUrl = encodeURIComponent(downloadUrl);
                    response.viewer_url = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
                }

                // For PDF URLs (large PDFs)
                if (response.type === 'pdf_url' && response.url) {
                    const urlWithToken = response.url.includes('?')
                        ? `${response.url}&token=${token}`
                        : `${response.url}?token=${token}`;

                    response.url = urlWithToken.startsWith('http')
                        ? urlWithToken
                        : `${cleanedBaseUrl}${urlWithToken}`;
                }

                return response;
            } catch (error) {
                this.error = error.message;
                console.error('View file content error:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        navigateTo(folderId) {
            if (folderId === null) {
                this.loadAllItems();
            } else {
                this.loadFolderContents(folderId);
            }
        },

        init() {
            const token = getAuthToken();
            if (!token) {
                console.warn('No access token found. Please login first.');
                this.error = 'Please login to access documents';
                return;
            }
            this.loadAllFolders();
        },
    },
});