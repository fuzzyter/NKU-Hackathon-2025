# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv  
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client['my_database']
users_collection = db['users']

@app.route('/')
def home():
    return "Flask와 MongoDB 연동 서버"

@app.route('/user', methods=['POST'])
def add_user():
    user_data = request.json
    result = users_collection.insert_one(user_data)
    return jsonify({"message": "사용자가 추가되었습니다.", "id": str(result.inserted_id)}), 201

@app.route('/users', methods=['GET'])
def get_users():
    all_users = []
    for user in users_collection.find():
        user['_id'] = str(user['_id'])
        all_users.append(user)
    return jsonify(all_users)

@app.route('/api/newsletters', methods=['GET'])
def get_newsletters():
    newsletters = list(db.newsletters.find())
    for item in newsletters:
        item['_id'] = str(item['_id'])
    return jsonify(newsletters)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)