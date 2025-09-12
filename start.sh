#!/bin/bash

# Trading Simulator Startup Script

echo "🚀 Starting Trading Simulator Full Stack Application..."

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   macOS: brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo "   Windows: net start MongoDB"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    cd backend
    python -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "📦 Installing backend dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📱 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Initialize database
echo "🗄️  Initializing database..."
cd database
python schemas.py
cd ..

echo "✅ Setup complete! Starting servers..."

# Start backend in background
echo "🔧 Starting Flask backend server..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "📱 Starting React Native frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Trading Simulator is now running!"
echo ""
echo "📊 Backend API: http://localhost:5000"
echo "📱 Frontend: http://localhost:19006"
echo "🗄️  MongoDB: mongodb://localhost:27017"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
