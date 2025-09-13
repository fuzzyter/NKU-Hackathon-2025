# 🚀 Supabase Setup Guide - Trading Quiz App

Follow these steps to set up your Supabase database:

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: **mifkzwxogesktjgbkoct** (based on your URL)

## Step 2: Open SQL Editor

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to create a new SQL script

## Step 3: Copy and Run the Schema

⚠️ **IMPORTANT**: Use `backend/trading_quiz_schema.sql` (NOT `supabase_schema.sql`)

Copy the **ENTIRE** contents from the file `backend/trading_quiz_schema.sql` and paste it into the SQL editor, then click **"Run"**.

### Quick Copy Commands:
```bash
# Option 1: Copy to clipboard (macOS)
cd /Users/ashokgaire/Desktop/Hackathon-2025/NKU-Hackathon-2025/backend
cat trading_quiz_schema.sql | pbcopy

# Option 2: View the file
cat trading_quiz_schema.sql
```

## Step 4: Verify Tables Created

After running the SQL, you should see these tables in your **Table Editor**:

✅ **quizzes** - Contains quiz questions and answers  
✅ **users_profile** - User profiles with XP and levels  
✅ **user_quiz_progress** - Tracks user quiz attempts  

Plus these views:
✅ **leaderboard** - Ranked users by XP  
✅ **quiz_statistics** - Quiz performance stats  
✅ **user_progress_summary** - User progress overview  

## Step 5: Test the Setup

1. Go to **Table Editor** in Supabase
2. Click on **"quizzes"** table
3. You should see 10 sample quiz questions about options trading

## Step 6: Start Your Backend Server

```bash
cd backend
source ../.venv/bin/activate
python quiz_app.py
```

Server will start on: http://localhost:5002

## Step 7: Test the API

```bash
# Test getting quizzes
curl http://localhost:5002/api/quizzes

# Run full test suite
python test_quiz_api.py
```

## 🔧 Troubleshooting

### If SQL fails to run:
1. Make sure you're in the correct Supabase project
2. Check that you copied the entire SQL file
3. Look for error messages in the SQL editor

### If API doesn't work:
1. Verify tables exist in Supabase Table Editor
2. Check your `.env` file has correct Supabase credentials
3. Make sure virtual environment is activated

### If you get permission errors:
1. The SQL includes proper RLS policies
2. Make sure you're using the correct Supabase keys in `.env`

## 📊 What Gets Created

### Tables:
- **quizzes**: 10 options trading questions (easy/medium/hard)
- **users_profile**: User accounts with XP system
- **user_quiz_progress**: Quiz attempt tracking

### Features:
- ✅ Automatic level calculation (XP ÷ 100)
- ✅ XP rewards for correct answers
- ✅ Prevents XP farming (only first correct answer counts)
- ✅ Leaderboard rankings
- ✅ Progress tracking per user
- ✅ Row Level Security enabled

### Sample Quiz Topics:
- What is a call option?
- Strike prices and expiration
- Options Greeks (Delta, time decay)
- Trading strategies (covered calls)
- Risk management concepts

## 🎯 Next Steps

After setup is complete:
1. ✅ Database schema created
2. ✅ Backend API running
3. ✅ Frontend service ready (`services/quizService.ts`)
4. 🔄 Integrate into your React Native app
5. 🔄 Build quiz UI components
6. 🔄 Add user authentication

---

**Need help?** The SQL file is at: `backend/trading_quiz_schema.sql`  
**API Documentation**: Check `backend/quiz_app.py` for all endpoints
