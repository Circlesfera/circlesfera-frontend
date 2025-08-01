"use client";

import { useEffect, useState } from 'react';

export default function NetworkTest() {
  const [testResults, setTestResults] = useState<any>({});

  const runTests = async () => {
    const results: any = {};

    // Test 1: Health check
    try {
      const healthResponse = await fetch('http://localhost:5001/api/health');
      const healthData = await healthResponse.json();
      results.health = {
        success: true,
        status: healthResponse.status,
        data: healthData
      };
    } catch (error: any) {
      results.health = {
        success: false,
        error: error.message
      };
    }

    // Test 2: Direct fetch to user profile
    try {
      const profileResponse = await fetch('http://localhost:5001/api/users/profile/demo');
      const profileData = await profileResponse.json();
      results.profile = {
        success: true,
        status: profileResponse.status,
        data: profileData
      };
    } catch (error: any) {
      results.profile = {
        success: false,
        error: error.message
      };
    }

    // Test 3: Test with Authorization header
    try {
      const authResponse = await fetch('http://localhost:5001/api/users/profile/demo', {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      const authData = await authResponse.json();
      results.profileWithAuth = {
        success: true,
        status: authResponse.status,
        data: authData
      };
    } catch (error: any) {
      results.profileWithAuth = {
        success: false,
        error: error.message
      };
    }

    setTestResults(results);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">🌐 Network Tests</h3>
      <button 
        onClick={runTests}
        className="btn-primary mb-3 w-full"
      >
        Re-run Tests
      </button>
      
      <div className="text-xs space-y-3">
        <div>
          <strong>Health Check:</strong>
          <div className="ml-2">
            {testResults.health?.success ? (
              <span className="text-green-600">✅ {testResults.health.status}</span>
            ) : (
              <span className="text-red-600">❌ {testResults.health?.error}</span>
            )}
          </div>
        </div>
        
        <div>
          <strong>Profile (No Auth):</strong>
          <div className="ml-2">
            {testResults.profile?.success ? (
              <span className="text-green-600">✅ {testResults.profile.status}</span>
            ) : (
              <span className="text-red-600">❌ {testResults.profile?.error}</span>
            )}
          </div>
        </div>
        
        <div>
          <strong>Profile (With Auth):</strong>
          <div className="ml-2">
            {testResults.profileWithAuth?.success ? (
              <span className="text-green-600">✅ {testResults.profileWithAuth.status}</span>
            ) : (
              <span className="text-red-600">❌ {testResults.profileWithAuth?.error}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 