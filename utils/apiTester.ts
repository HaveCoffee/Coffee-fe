// utils/apiTester.ts
import { getCoffeeMlToken } from '../services/coffeeMlAuthService';
import { userChatService } from '../services/userChatService';
import { userService } from '../services/userService';
import { apiRequest, coffeeMlApiRequest } from './api';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  response?: any;
  error?: string;
  duration: number;
}

export class APITester {
  private token: string | null = null;
  private results: TestResult[] = [];

  async initialize() {
    this.token = await getCoffeeMlToken();
    if (!this.token) {
      throw new Error('No authentication token found. Please login first.');
    }
    console.log('🔑 Token loaded:', this.token.substring(0, 20) + '...');
  }

  private async testEndpoint(
    endpoint: string,
    method: string,
    data?: any,
    useAuthApi: boolean = false
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${method} ${endpoint}...`);
      
      let response;
      if (useAuthApi) {
        response = await apiRequest(endpoint, method, data, this.token);
      } else {
        response = await coffeeMlApiRequest(endpoint, method, data, this.token);
      }
      
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint,
        method,
        status: 'PASS',
        response,
        duration
      };
      
      console.log(`✅ ${method} ${endpoint} - PASS (${duration}ms)`);
      return result;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint,
        method,
        status: error.status ? 'FAIL' : 'ERROR',
        error: error.message,
        response: error.response,
        duration
      };
      
      console.log(`❌ ${method} ${endpoint} - ${result.status} (${duration}ms): ${error.message}`);
      return result;
    }
  }

  async testAllEndpoints(): Promise<TestResult[]> {
    await this.initialize();
    this.results = [];

    console.log('🚀 Starting comprehensive API testing...\n');

    // Test Coffee-ML APIs
    console.log('📋 Testing Coffee-ML APIs...');
    this.results.push(await this.testEndpoint('/api/profile', 'GET'));
    this.results.push(await this.testEndpoint('/api/matches/suggested', 'GET'));
    this.results.push(await this.testEndpoint('/api/matches/active', 'GET'));
    this.results.push(await this.testEndpoint('/api/matches/start-chat', 'POST', { match_id: 'test-match' }));
    this.results.push(await this.testEndpoint('/api/matches/pass', 'POST', { match_id: 'test-match' }));
    this.results.push(await this.testEndpoint('/api/matches/block', 'POST', { match_id: 'test-match' }));
    this.results.push(await this.testEndpoint('/api/users/test-user', 'GET'));
    this.results.push(await this.testEndpoint('/chat', 'POST', { message: 'Hello Ella, this is a test message' }));

    // Test Auth APIs
    console.log('\n👤 Testing Auth APIs...');
    this.results.push(await this.testEndpoint('/me', 'GET', null, true));

    // Test User Chat APIs
    console.log('\n💬 Testing User Chat APIs...');
    this.results.push(await this.testUserChatEndpoint('test-user'));

    console.log('\n📊 API Testing Complete!');
    this.printSummary();
    
    return this.results;
  }

  private async testUserChatEndpoint(userId: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing user chat with ${userId}...`);
      
      const response = await userChatService.getChatMessages(userId);
      
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint: `/chat/${userId}`,
        method: 'GET',
        status: 'PASS',
        response,
        duration
      };
      
      console.log(`✅ GET /chat/${userId} - PASS (${duration}ms)`);
      return result;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        endpoint: `/chat/${userId}`,
        method: 'GET',
        status: error.status ? 'FAIL' : 'ERROR',
        error: error.message,
        response: error.response,
        duration
      };
      
      console.log(`❌ GET /chat/${userId} - ${result.status} (${duration}ms): ${error.message}`);
      return result;
    }
  }

  private printSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`🔥 Errors: ${errors}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🔥';
      console.log(`${index + 1}. ${status} ${result.method} ${result.endpoint} (${result.duration}ms)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n🔍 FAILED ENDPOINTS:');
    const failedEndpoints = this.results.filter(r => r.status !== 'PASS');
    if (failedEndpoints.length === 0) {
      console.log('🎉 All endpoints are working correctly!');
    } else {
      failedEndpoints.forEach(result => {
        console.log(`❌ ${result.method} ${result.endpoint}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Error: ${result.error}`);
        if (result.response) {
          console.log(`   Response: ${JSON.stringify(result.response, null, 2)}`);
        }
        console.log('');
      });
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getFailedEndpoints(): TestResult[] {
    return this.results.filter(r => r.status !== 'PASS');
  }
}

// Export singleton instance
export const apiTester = new APITester();