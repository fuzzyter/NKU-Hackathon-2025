#!/usr/bin/env python3
"""
Test script for the Trading Quiz API
"""

import requests
import json
import uuid

# API Base URL
BASE_URL = "http://localhost:5002/api"

def test_api():
    print("🧪 Testing Trading Quiz API")
    print("=" * 50)
    
    # Test 1: Get all quizzes
    print("\n1️⃣ Testing: Get all quizzes")
    try:
        response = requests.get(f"{BASE_URL}/quizzes")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data['data'])} quizzes")
            if data['data']:
                print(f"   First quiz: {data['data'][0]['question'][:50]}...")
        else:
            print(f"❌ Failed to get quizzes: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting quizzes: {e}")
    
    # Test 2: Create a user profile
    print("\n2️⃣ Testing: Create user profile")
    test_user_id = str(uuid.uuid4())
    try:
        user_data = {
            "username": "testuser123",
            "user_id": test_user_id
        }
        response = requests.post(f"{BASE_URL}/users/profile", json=user_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Created user: {data['data']['username']}")
            print(f"   User ID: {data['data']['id']}")
            print(f"   Level: {data['data']['level']}, XP: {data['data']['total_xp']}")
        else:
            print(f"❌ Failed to create user: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error creating user: {e}")
    
    # Test 3: Get user profile
    print("\n3️⃣ Testing: Get user profile")
    try:
        response = requests.get(f"{BASE_URL}/users/{test_user_id}/profile")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved user profile")
            print(f"   Username: {data['data']['username']}")
            print(f"   Level: {data['data']['level']}, XP: {data['data']['total_xp']}, Balance: {data['data']['balance']}")
        else:
            print(f"❌ Failed to get user profile: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting user profile: {e}")
    
    # Test 4: Submit a quiz answer (correct)
    print("\n4️⃣ Testing: Submit correct quiz answer")
    try:
        answer_data = {"selected_choice": 0}  # First quiz has correct answer at index 0
        response = requests.post(f"{BASE_URL}/users/{test_user_id}/quiz/1/answer", json=answer_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Answer submitted successfully")
            print(f"   Correct: {data['correct']}")
            print(f"   XP Earned: {data['xp_earned']}")
            print(f"   Explanation: {data['explanation'][:50]}...")
        else:
            print(f"❌ Failed to submit answer: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error submitting answer: {e}")
    
    # Test 5: Submit a quiz answer (incorrect)
    print("\n5️⃣ Testing: Submit incorrect quiz answer")
    try:
        answer_data = {"selected_choice": 3}  # Wrong answer
        response = requests.post(f"{BASE_URL}/users/{test_user_id}/quiz/2/answer", json=answer_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Answer submitted successfully")
            print(f"   Correct: {data['correct']}")
            print(f"   XP Earned: {data['xp_earned']}")
            print(f"   Correct choice was: {data['correct_choice']}")
        else:
            print(f"❌ Failed to submit answer: {response.status_code}")
    except Exception as e:
        print(f"❌ Error submitting answer: {e}")
    
    # Test 6: Get user progress
    print("\n6️⃣ Testing: Get user quiz progress")
    try:
        response = requests.get(f"{BASE_URL}/users/{test_user_id}/quiz-progress")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved quiz progress")
            print(f"   Number of quizzes attempted: {len(data['data'])}")
            for progress in data['data']:
                print(f"   Quiz {progress['quiz_id']}: {progress['attempts']} attempts, best score: {progress['best_score']}")
        else:
            print(f"❌ Failed to get progress: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting progress: {e}")
    
    # Test 7: Get updated user stats
    print("\n7️⃣ Testing: Get updated user stats")
    try:
        response = requests.get(f"{BASE_URL}/users/{test_user_id}/stats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved user stats")
            stats = data['data']
            print(f"   Level: {stats['level']}, Total XP: {stats['total_xp']}")
            print(f"   Quizzes attempted: {stats['quizzes_attempted']}")
            print(f"   Quizzes completed: {stats['quizzes_completed']}")
            print(f"   XP from quizzes: {stats['xp_from_quizzes']}")
        else:
            print(f"❌ Failed to get user stats: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting user stats: {e}")
    
    # Test 8: Get leaderboard
    print("\n8️⃣ Testing: Get leaderboard")
    try:
        response = requests.get(f"{BASE_URL}/leaderboard?limit=10")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved leaderboard")
            print(f"   Number of entries: {len(data['data'])}")
            for i, entry in enumerate(data['data'][:3]):
                print(f"   #{entry['rank']}: {entry['username']} - Level {entry['level']} ({entry['total_xp']} XP)")
        else:
            print(f"❌ Failed to get leaderboard: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting leaderboard: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\nTo start the quiz server:")
    print("   cd backend && python quiz_app.py")
    print("\nAPI Documentation:")
    print("   GET  /api/quizzes - Get all quizzes")
    print("   POST /api/users/profile - Create user profile")
    print("   POST /api/users/{user_id}/quiz/{quiz_id}/answer - Submit quiz answer")
    print("   GET  /api/users/{user_id}/quiz-progress - Get user progress")
    print("   GET  /api/leaderboard - Get leaderboard")

if __name__ == "__main__":
    test_api()
