from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import bcrypt
import yfinance as yf
import pandas as pd
import numpy as np

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

# Import routes
from routes.auth import auth_bp
from routes.users import users_bp
from routes.portfolio import portfolio_bp
from routes.market_data import market_data_bp
from routes.leaderboard import leaderboard_bp
from routes.friends import friends_bp
from routes.education import education_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
app.register_blueprint(market_data_bp, url_prefix='/api/market')
app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')
app.register_blueprint(friends_bp, url_prefix='/api/friends')
app.register_blueprint(education_bp, url_prefix='/api/education')

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
