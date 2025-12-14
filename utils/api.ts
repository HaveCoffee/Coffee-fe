// utils/api.ts
// Auth API base URL (from http://3.110.104.45/api-docs/)
const AUTH_API_BASE_URL = 'http://3.110.104.45/api';
// Chat API base URL
const CHAT_API_BASE_URL = 'http://3.110.104.45:3001/api/v1';

// Default to auth API for backward compatibility
const API_BASE_URL = AUTH_API_BASE_URL;

interface ApiResponse {
  message: string;
  [key: string]: any;
}

export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  token: string | null = null,
  baseUrl?: string
): Promise<ApiResponse> => {
  const url = baseUrl || API_BASE_URL;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    console.log(`API Request: ${method} ${url}${endpoint}`, { data });
    const response = await fetch(`${url}${endpoint}`, config);
    
    // Clone the response to read it multiple times if needed
    const responseClone = response.clone();
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (e) {
      const text = await response.text();
      throw new Error(`Invalid JSON response from server: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || 
                         responseData?.error || 
                         `HTTP error! Status: ${response.status}`;
      
      const errorInfo = {
        endpoint,
        method,
        requestData: data,
        responseData,
        status: response.status,
        statusText: response.statusText,
        error: errorMessage
      };
      
      console.error('API Request Failed:', errorInfo);
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error: any) {
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
};

// Export base URLs for use in services
export { AUTH_API_BASE_URL, CHAT_API_BASE_URL };
