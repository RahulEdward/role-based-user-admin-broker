#!/usr/bin/env python3
"""
Test the complete authentication system
"""
import sys
sys.path.append('.')
from main import app
from fastapi.testclient import TestClient
import json

def test_complete_flow():
    client = TestClient(app)
    
    print("🧪 Testing Complete Authentication Flow")
    print("=" * 50)
    
    # Test 1: Registration
    print("\n1. Testing Registration...")
    import time
    timestamp = str(int(time.time()))
    register_data = {
        'username': f'testuser{timestamp}',
        'email': f'testuser{timestamp}@example.com', 
        'password': 'TestPass123!',
        'broker_name': 'angel',
        'api_key': f'test_api_key_{timestamp}'
    }
    
    response = client.post('/api/auth/register', json=register_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Registration successful")
        user_data = response.json()
        print(f"   User ID: {user_data['id']}, Username: {user_data['username']}")
    else:
        print(f"   ❌ Registration failed: {response.text}")
        return
    
    # Test 2: Login
    print("\n2. Testing Login...")
    login_data = {
        'username': register_data['username'],
        'password': 'TestPass123!'
    }
    
    response = client.post('/api/auth/login', data=login_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Login successful")
        auth_data = response.json()
        token = auth_data['access_token']
        print(f"   Token: {token[:20]}...")
    else:
        print(f"   ❌ Login failed: {response.text}")
        return
    
    # Test 3: Get current user
    print("\n3. Testing Get Current User...")
    headers = {'Authorization': f'Bearer {token}'}
    response = client.get('/api/users/me', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Get user successful")
        user = response.json()
        print(f"   User: {user['username']}, 2FA: {user['is_2fa_enabled']}")
    else:
        print(f"   ❌ Get user failed: {response.text}")
        return
    
    # Test 4: Setup 2FA
    print("\n4. Testing 2FA Setup...")
    response = client.post('/api/auth/setup-2fa', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ 2FA setup successful")
        totp_data = response.json()
        secret = totp_data['secret']
        print(f"   Secret: {secret[:10]}...")
    else:
        print(f"   ❌ 2FA setup failed: {response.text}")
        return
    
    # Test 5: Generate TOTP code and verify
    print("\n5. Testing 2FA Verification...")
    import pyotp
    totp = pyotp.TOTP(secret)
    current_code = totp.now()
    print(f"   Generated TOTP: {current_code}")
    
    verify_data = {'token': current_code}
    response = client.post('/api/auth/verify-2fa', json=verify_data, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ 2FA verification successful")
    else:
        print(f"   ❌ 2FA verification failed: {response.text}")
        return
    
    # Test 6: Broker Login
    print("\n6. Testing Broker Login...")
    new_code = totp.now()  # Generate fresh code
    broker_data = {
        'client_id': 'TEST123456',
        'pin': '1234',
        'totp_token': new_code
    }
    
    response = client.post('/api/auth/broker-login', json=broker_data, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Broker login successful")
        broker_response = response.json()
        print(f"   Access Token: {broker_response['access_token'][:20]}...")
        print(f"   Feed Token: {broker_response['feed_token'][:20]}...")
    else:
        print(f"   ❌ Broker login failed: {response.text}")
        return
    
    # Test 7: Get Broker Profile
    print("\n7. Testing Broker Profile...")
    response = client.get('/api/broker/profile', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Broker profile successful")
        profile = response.json()
        print(f"   Session Active: {profile['broker_session_active']}")
        print(f"   Client ID: {profile['client_id']}")
    else:
        print(f"   ❌ Broker profile failed: {response.text}")
    
    # Test 8: Logout
    print("\n8. Testing Logout...")
    response = client.post('/api/auth/logout', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Logout successful")
        print(f"   Message: {response.json()['message']}")
    else:
        print(f"   ❌ Logout failed: {response.text}")
    
    print("\n" + "=" * 50)
    print("🎉 Complete flow test finished!")

if __name__ == "__main__":
    test_complete_flow()