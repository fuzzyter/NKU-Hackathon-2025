from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime
import os
import yfinance as yf

portfolio_bp = Blueprint('portfolio', __name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.trading_simulator

@portfolio_bp.route('/', methods=['GET'])
@jwt_required()
def get_portfolio():
    try:
        user_id = get_jwt_identity()
        
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        portfolio = user.get('portfolio', {})
        
        # Calculate portfolio summary
        total_value = portfolio.get('cashBalance', 10000)
        total_pl = 0
        positions = []
        
        for position in portfolio.get('positions', []):
            try:
                # Get current price
                ticker = yf.Ticker(position['symbol'])
                current_price = ticker.history(period='1d')['Close'].iloc[-1]
                
                # Calculate position value and P&L
                position_value = current_price * position['quantity']
                position_pl = position_value - (position['avgPrice'] * position['quantity'])
                position_pl_percent = (position_pl / (position['avgPrice'] * position['quantity'])) * 100
                
                total_value += position_value
                total_pl += position_pl
                
                positions.append({
                    'id': str(position.get('_id', '')),
                    'symbol': position['symbol'],
                    'type': position.get('type', 'stock'),
                    'quantity': position['quantity'],
                    'avgPrice': position['avgPrice'],
                    'currentPrice': float(current_price),
                    'totalValue': position_value,
                    'unrealizedPL': position_pl,
                    'unrealizedPLPercent': position_pl_percent,
                    'optionDetails': position.get('optionDetails')
                })
                
            except Exception as e:
                print(f"Error fetching data for {position['symbol']}: {e}")
                continue
        
        total_pl_percent = (total_pl / (total_value - total_pl)) * 100 if total_value > total_pl else 0
        
        return jsonify({
            'portfolio': {
                'totalValue': total_value,
                'dayChange': 0,  # Would need to track previous day's value
                'dayChangePercent': 0,
                'totalPL': total_pl,
                'totalPLPercent': total_pl_percent,
                'cashBalance': portfolio.get('cashBalance', 10000),
                'buyingPower': portfolio.get('cashBalance', 10000),
                'positions': positions
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/positions', methods=['POST'])
@jwt_required()
def add_position():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['symbol', 'quantity', 'price', 'type']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        symbol = data['symbol'].upper()
        quantity = float(data['quantity'])
        price = float(data['price'])
        position_type = data['type']
        action = data.get('action', 'buy')
        
        # Calculate total cost
        total_cost = quantity * price * 100 if position_type == 'option' else quantity * price
        
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        portfolio = user.get('portfolio', {'cashBalance': 10000, 'positions': []})
        
        # Check if user has enough cash
        if portfolio['cashBalance'] < total_cost:
            return jsonify({'error': 'Insufficient funds'}), 400
        
        # Check if position already exists
        existing_position = None
        for pos in portfolio['positions']:
            if (pos['symbol'] == symbol and 
                pos.get('type') == position_type and
                pos.get('optionDetails') == data.get('optionDetails')):
                existing_position = pos
                break
        
        if existing_position:
            # Update existing position (average price calculation)
            old_quantity = existing_position['quantity']
            old_avg_price = existing_position['avgPrice']
            
            new_quantity = old_quantity + quantity
            new_avg_price = ((old_quantity * old_avg_price) + (quantity * price)) / new_quantity
            
            existing_position['quantity'] = new_quantity
            existing_position['avgPrice'] = new_avg_price
            
        else:
            # Create new position
            new_position = {
                'symbol': symbol,
                'type': position_type,
                'quantity': quantity,
                'avgPrice': price,
                'createdAt': datetime.utcnow(),
                'optionDetails': data.get('optionDetails')
            }
            portfolio['positions'].append(new_position)
        
        # Update cash balance
        portfolio['cashBalance'] -= total_cost
        
        # Update user document
        db.users.update_one(
            {'_id': user_id},
            {
                '$set': {
                    'portfolio': portfolio,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'Position added successfully'}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/positions/<position_id>', methods=['DELETE'])
@jwt_required()
def remove_position():
    try:
        user_id = get_jwt_identity()
        position_id = request.view_args['position_id']
        
        user = db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        portfolio = user.get('portfolio', {'positions': []})
        
        # Find and remove position
        position_to_remove = None
        for pos in portfolio['positions']:
            if str(pos.get('_id', '')) == position_id:
                position_to_remove = pos
                break
        
        if not position_to_remove:
            return jsonify({'error': 'Position not found'}), 404
        
        # Get current price to calculate proceeds
        try:
            ticker = yf.Ticker(position_to_remove['symbol'])
            current_price = ticker.history(period='1d')['Close'].iloc[-1]
            
            # Calculate proceeds
            proceeds = current_price * position_to_remove['quantity']
            if position_to_remove.get('type') == 'option':
                proceeds *= 100
            
            # Update cash balance
            portfolio['cashBalance'] += proceeds
            
        except Exception as e:
            # If we can't get current price, use average price
            proceeds = position_to_remove['avgPrice'] * position_to_remove['quantity']
            if position_to_remove.get('type') == 'option':
                proceeds *= 100
            portfolio['cashBalance'] += proceeds
        
        # Remove position
        portfolio['positions'] = [pos for pos in portfolio['positions'] 
                                if str(pos.get('_id', '')) != position_id]
        
        # Update user document
        db.users.update_one(
            {'_id': user_id},
            {
                '$set': {
                    'portfolio': portfolio,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'Position removed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/history', methods=['GET'])
@jwt_required()
def get_trade_history():
    try:
        user_id = get_jwt_identity()
        
        # Get trade history from trades collection
        trades = list(db.trades.find({'userId': user_id}).sort('createdAt', -1).limit(100))
        
        # Convert ObjectId to string
        for trade in trades:
            trade['id'] = str(trade['_id'])
            del trade['_id']
        
        return jsonify({'trades': trades}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
