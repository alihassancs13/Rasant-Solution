
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js';

export const fetchEmployeesApi = async ({ search = '', page = 1, page_size = 5 } = {}) => {
  try {
    // 1. Construct dynamic query parameters
    const queryParams = new URLSearchParams({
      search: search,
      page: page.toString(),
      page_size: page_size.toString()
    });

    // 2. Safely clean up URLs to avoid double slashes (//) when combining paths
    const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanedEndpoint = API_ENDPOINTS.GET_EMPLOYEES.startsWith('/')
      ? API_ENDPOINTS.GET_EMPLOYEES
      : `/${API_ENDPOINTS.GET_EMPLOYEES}`;

    const fullUrl = `${cleanedBaseUrl}${cleanedEndpoint}?${queryParams.toString()}`;

    // 3. Match the token key used in your sidebarApi.js ('accessToken')
    const token = localStorage.getItem('accessToken');

    // 4. Construct request headers dynamically
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 5. Execute API network request
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: headers
    });

    // 6. Detailed API response tracking & Error Handling
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error in fetchEmployeesApi:', error);
    throw error;
  }
};