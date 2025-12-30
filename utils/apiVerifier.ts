// utils/apiVerifier.ts
// Utility to verify and test API endpoints
import { getAuthToken } from '../services/authService';
import { getCoffeeMlToken } from '../services/coffeeMlAuthService';
import { CHAT_API_BASE_URL, COFFEE_ML_API_BASE_URL } from './api';

export interface EndpointTest {
  endpoint: string;
  method: string;
  baseUrl: string;
  status: 'success' | 'failed' | 'not_tested';
  response?: any;
  error?: string;
}

/**
 * Test a specific endpoint
 */
export async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  baseUrl: string = CHAT_API_BASE_URL,
  explicitToken?: string | null
): Promise<EndpointTest> {
  try {
    const token = explicitToken ?? (await getAuthToken());
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[JWT] 📤 JWT token sent in API verifier request', {
        method,
        endpoint,
        baseUrl,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        hasAuthorizationHeader: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('[JWT] 📤 API verifier request sent WITHOUT JWT token', {
        method,
        endpoint,
        baseUrl,
        hasAuthorizationHeader: false,
        timestamp: new Date().toISOString(),
      });
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${baseUrl}${endpoint}`, config);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    return {
      endpoint,
      method,
      baseUrl,
      status: response.ok ? 'success' : 'failed',
      response: responseData,
      error: response.ok ? undefined : `Status ${response.status}: ${responseText.substring(0, 100)}`,
    };
  } catch (error: any) {
    return {
      endpoint,
      method,
      baseUrl,
      status: 'failed',
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Verify common chat API endpoints
 */
export async function verifyChatAPIEndpoints(): Promise<EndpointTest[]> {
  const authToken = await getAuthToken();
  const coffeeMlToken = await getCoffeeMlToken();
  if (!authToken && !coffeeMlToken) {
    console.warn('No auth or Coffee-ml token available for API verification');
    return [];
  }

  // Only test endpoints that are explicitly documented in the Coffee-ml README:
  // - POST /chat
  // - GET  /api/profile
  // - GET  /api/matches
  const commonEndpoints = [
    { path: '/chat', method: 'POST', data: { message: 'test from verifier' } },
    { path: '/api/profile', method: 'GET' },
    { path: '/api/matches', method: 'GET' },
  ];

  const results: EndpointTest[] = [];

  // Test only against the Coffee-ml API base URL, using the Coffee-ml token
  for (const endpoint of commonEndpoints) {
    const coffeeMlResult = await testEndpoint(
      endpoint.path,
      endpoint.method as 'GET' | 'POST',
      endpoint.data || null,
      COFFEE_ML_API_BASE_URL,
      coffeeMlToken
    );
    results.push(coffeeMlResult);
  }

  return results;
}

/**
 * Log API verification results
 */
export function logVerificationResults(results: EndpointTest[]) {
  console.log('\n=== API Endpoint Verification Results ===\n');
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');

  if (successful.length > 0) {
    console.log('✅ Working Endpoints:');
    successful.forEach(result => {
      console.log(`  ${result.method} ${result.baseUrl}${result.endpoint}`);
    });
    console.log('');
  }

  if (failed.length > 0) {
    console.log('❌ Failed Endpoints:');
    failed.forEach(result => {
      console.log(`  ${result.method} ${result.baseUrl}${result.endpoint}`);
      if (result.error) {
        console.log(`    Error: ${result.error.substring(0, 80)}...`);
      }
    });
    console.log('');
  }

  console.log(`Total: ${results.length} endpoints tested`);
  console.log(`Success: ${successful.length}, Failed: ${failed.length}\n`);
}
