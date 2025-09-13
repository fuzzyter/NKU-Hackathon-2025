# Supabase Setup Guide

This guide will help you set up Supabase for your Options Trading Education App.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be fully set up

## 2. Get Your Supabase Credentials

1. Go to your project settings
2. Navigate to "API" section
3. Copy the following:
   - Project URL
   - Anon (public) key
   - Service role key (optional, for admin operations)

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root (copy from `env.example`)
2. Add your Supabase credentials:

```env
# Frontend (Expo)
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend (Python Flask)
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `backend/supabase_schema.sql`
4. Run the SQL script to create all necessary tables

## 5. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## 6. Test the Setup

1. Start your Flask backend:
```bash
cd backend
python app.py
```

2. Test the API endpoints:
```bash
# Create a user profile
curl -X POST http://localhost:5001/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com"}'

# Get user stats
curl http://localhost:5001/api/user/YOUR_USER_ID/stats
```

## Database Schema Overview

### Tables Created:
- `user_profiles` - User information and progress
- `experience_logs` - Track experience point gains
- `quiz_attempts` - Quiz attempt records
- `learning_progress` - Content progress tracking
- `user_achievements` - Badge/achievement system
- `daily_streaks` - Daily activity tracking

### Key Features:
- Row Level Security (RLS) enabled
- Automatic level calculation based on experience
- Leaderboard views
- Comprehensive user statistics

## API Endpoints

### User Management
- `POST /api/user/profile` - Create user profile
- `GET /api/user/{user_id}/profile` - Get user profile
- `GET /api/user/{user_id}/stats` - Get user statistics

### Experience System
- `POST /api/user/{user_id}/experience` - Add experience points

### Quiz System
- `POST /api/quiz/attempt` - Submit quiz attempt
- `GET /api/user/{user_id}/quiz-attempts` - Get user's quiz attempts

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data

### Achievements
- `POST /api/user/{user_id}/badge` - Award badge to user

## Frontend Integration

The `supabaseService.ts` provides a complete TypeScript service for:
- User profile management
- Experience tracking
- Quiz attempt submission
- Progress tracking
- Leaderboard functionality

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Use the service role key only for admin operations
- Never expose the service role key in frontend code

## Troubleshooting

1. **Connection Issues**: Check your environment variables
2. **Permission Errors**: Ensure RLS policies are set up correctly
3. **Schema Issues**: Make sure all SQL scripts ran successfully
4. **API Errors**: Check Flask logs for detailed error messages
