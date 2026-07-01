// services/employee_dashboardApi.js
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js';

export const employeeDashboardApi = {
    /**
     * Sends a raw document to Django backend to parse name, contact, and job fields.
     * @param {File} fileObject
     * @returns {Promise<Object>} Parsed CV data
     */
    async parseCvDocument(fileObject) {
        if (!fileObject) {
            throw new Error('No file provided');
        }

        const payload = new FormData();
        payload.append('cv_file', fileObject);

        try {
            const url = `${BASE_URL}${API_ENDPOINTS.PARSE_CV}`;
            console.log('Sending CV to:', url);

            const response = await fetch(url, {
                method: 'POST',
                body: payload,
            });

            console.log('Response status:', response.status);

            // Check if response is ok
            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = `Server error (${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (e) {
                    // If can't parse JSON, use status text
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Parse successful response
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('CV Parsing Error:', error);

            // Handle specific error cases
            if (error.message.includes('404')) {
                throw new Error('CV parsing service not available. Please check the server configuration.');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your connection.');
            }

            throw error;
        }
    }
};