#!/usr/bin/env python3
"""
Test script to verify Supabase connection works correctly
"""

import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def test_supabase_connection():
    """Test the Supabase connection"""
    print("🔍 Testing Supabase Connection...")
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url:
        print("❌ SUPABASE_URL not found in environment variables")
        print("   Please add it to your .env file")
        return False
    
    if not supabase_key:
        print("❌ SUPABASE_ANON_KEY not found in environment variables")
        print("   Please add it to your .env file")
        return False
    
    print(f"✅ Environment variables loaded")
    print(f"   URL: {supabase_url}")
    print(f"   Key: {supabase_key[:20]}...")
    
    # Test Supabase client import
    try:
        from supabase_client import supabase_client
        print("✅ Supabase client imported successfully")
    except Exception as e:
        print(f"❌ Failed to import Supabase client: {e}")
        return False
    
    # Test basic connection
    try:
        # Try to access the supabase client
        client = supabase_client.supabase
        print("✅ Supabase client initialized")
        
        # Test a simple query (this will fail if tables don't exist, but connection works)
        try:
            result = client.table('user_profiles').select('id').limit(1).execute()
            print("✅ Database connection successful!")
            print(f"   Tables are accessible")
        except Exception as e:
            if "relation" in str(e).lower() or "table" in str(e).lower():
                print("⚠️  Database connection works, but tables not created yet")
                print("   Run the SQL schema in your Supabase dashboard")
            else:
                print(f"❌ Database query failed: {e}")
                return False
                
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        return False
    
    return True

def test_api_endpoints():
    """Test Flask API endpoints"""
    print("\n🔍 Testing Flask API...")
    
    try:
        from app import app
        print("✅ Flask app imported successfully")
        
        # Test app configuration
        with app.test_client() as client:
            response = client.get('/')
            if response.status_code == 200:
                print("✅ Flask app is running")
                print(f"   Response: {response.get_data(as_text=True)}")
            else:
                print(f"❌ Flask app returned status {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Failed to test Flask app: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Supabase Backend Connection Test")
    print("=" * 50)
    
    # Test connection
    connection_ok = test_supabase_connection()
    
    # Test Flask API
    api_ok = test_api_endpoints()
    
    print("\n" + "=" * 50)
    if connection_ok and api_ok:
        print("🎉 All tests passed! Your backend is ready to use.")
        print("\nNext steps:")
        print("1. Make sure you've run the SQL schema in Supabase")
        print("2. Start your Flask server: python app.py")
        print("3. Test the API endpoints")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        
    print("\n📚 Useful commands:")
    print("   Start server: python app.py")
    print("   Test API: curl http://localhost:5001/")
    print("   View schema: cat supabase_schema.sql")
