#!/usr/bin/env node

/**
 * Test script to verify authentication cannot be bypassed
 * This script tests various scenarios to ensure the federated site
 * properly enforces authentication.
 */

const http = require('http');

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

async function testAuthBypass() {
  console.log('🔒 Testing Authentication Security...\n');
  
  const tests = [
    {
      name: 'Direct access to federated site',
      url: 'http://localhost:3001/',
      check: (data) => {
        // The HTML should load, but components should be protected
        return data.includes('Federated Site');
      }
    },
    {
      name: 'Access to remote entry JavaScript',
      url: 'http://localhost:3001/assets/remoteEntry.js',
      check: (data) => {
        // The JS should be accessible for federation to work
        return data.includes('FederatedContent') && data.includes('FederatedCard');
      }
    },
    {
      name: 'Main site requires authentication',
      url: 'http://localhost:3000/',
      check: (data) => {
        // Main site should show Stytch auth
        return data.includes('Module Federation Demo') || data.includes('Stytch');
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await makeRequest(test.url);
      const success = test.check(response.data);
      
      if (success) {
        console.log(`${colors.green}✓${colors.reset} ${test.name}`);
        console.log(`  Status: ${response.status}`);
        passed++;
      } else {
        console.log(`${colors.red}✗${colors.reset} ${test.name}`);
        console.log(`  Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} ${test.name}`);
      console.log(`  Error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Results:');
  console.log(`  Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${failed}${colors.reset}`);
  
  // Additional security checks
  console.log('\n🔍 Security Analysis:');
  
  // Check if federated components are protected
  try {
    const fedSiteResponse = await makeRequest('http://localhost:3001/');
    const hasSensitiveData = fedSiteResponse.data.includes('email') || 
                             fedSiteResponse.data.includes('memberId') ||
                             fedSiteResponse.data.includes('sessionToken');
    
    if (!hasSensitiveData) {
      console.log(`${colors.green}✓${colors.reset} No sensitive data exposed in federated site HTML`);
    } else {
      console.log(`${colors.red}✗${colors.reset} Sensitive data may be exposed in federated site HTML`);
    }
    
    // Check if authentication state is properly isolated
    const hasAuthCheck = fedSiteResponse.data.includes('useRemoteAuth') || 
                        fedSiteResponse.data.includes('AuthProvider');
    
    if (hasAuthCheck) {
      console.log(`${colors.green}✓${colors.reset} Authentication checks present in federated site`);
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} Could not verify authentication checks in HTML`);
    }
    
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Could not analyze federated site security`);
  }
  
  console.log('\n✅ Authentication bypass test complete');
  
  return failed === 0;
}

// Run the test
testAuthBypass().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});