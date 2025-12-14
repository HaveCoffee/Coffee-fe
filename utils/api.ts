// utils/api.ts
const API_BASE_URL = 'http://3.110.104.45/api';

interface ApiResponse {
  message: string;
  [key: string]: any;
}

export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  token: string | null = null
): Promise<ApiResponse> => {
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
    console.log(`API Request: ${method} ${endpoint}`, { data });
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
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