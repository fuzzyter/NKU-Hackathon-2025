from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import requests

market_data_bp = Blueprint('market_data', __name__)

@market_data_bp.route('/quote/<symbol>', methods=['GET'])
@jwt_required()
def get_stock_quote():
    try:
        symbol = request.view_args['symbol'].upper()
        
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period='1d')
        
        if hist.empty:
            return jsonify({'error': 'Symbol not found'}), 404
        
        current_price = hist['Close'].iloc[-1]
        previous_close = info.get('previousClose', current_price)
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close > 0 else 0
        
        quote = {
            'symbol': symbol,
            'price': float(current_price),
            'change': float(change),
            'changePercent': float(change_percent),
            'volume': int(hist['Volume'].iloc[-1]),
            'high': float(hist['High'].iloc[-1]),
            'low': float(hist['Low'].iloc[-1]),
            'open': float(hist['Open'].iloc[-1]),
            'previousClose': float(previous_close),
            'marketCap': info.get('marketCap'),
            'companyName': info.get('longName', symbol),
            'sector': info.get('sector'),
            'industry': info.get('industry')
        }
        
        return jsonify({'quote': quote}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_data_bp.route('/options/<symbol>', methods=['GET'])
@jwt_required()
def get_option_chain():
    try:
        symbol = request.view_args['symbol'].upper()
        
        ticker = yf.Ticker(symbol)
        
        # Get expiration dates
        expirations = ticker.options
        if not expirations:
            return jsonify({'error': 'No options data available'}), 404
        
        # Get the nearest expiration
        nearest_expiration = expirations[0]
        
        # Get option chain
        option_chain = ticker.option_chain(nearest_expiration)
        
        # Format calls
        calls = []
        for _, call in option_chain.calls.iterrows():
            calls.append({
                'strike': float(call['strike']),
                'lastPrice': float(call['lastPrice']) if pd.notna(call['lastPrice']) else 0,
                'bid': float(call['bid']) if pd.notna(call['bid']) else 0,
                'ask': float(call['ask']) if pd.notna(call['ask']) else 0,
                'volume': int(call['volume']) if pd.notna(call['volume']) else 0,
                'openInterest': int(call['openInterest']) if pd.notna(call['openInterest']) else 0,
                'impliedVolatility': float(call['impliedVolatility']) if pd.notna(call['impliedVolatility']) else 0
            })
        
        # Format puts
        puts = []
        for _, put in option_chain.puts.iterrows():
            puts.append({
                'strike': float(put['strike']),
                'lastPrice': float(put['lastPrice']) if pd.notna(put['lastPrice']) else 0,
                'bid': float(put['bid']) if pd.notna(put['bid']) else 0,
                'ask': float(put['ask']) if pd.notna(put['ask']) else 0,
                'volume': int(put['volume']) if pd.notna(put['volume']) else 0,
                'openInterest': int(put['openInterest']) if pd.notna(put['openInterest']) else 0,
                'impliedVolatility': float(put['impliedVolatility']) if pd.notna(put['impliedVolatility']) else 0
            })
        
        return jsonify({
            'symbol': symbol,
            'expiration': nearest_expiration,
            'calls': calls,
            'puts': puts
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_data_bp.route('/search', methods=['GET'])
@jwt_required()
def search_symbols():
    try:
        query = request.args.get('q', '').upper()
        
        if len(query) < 1:
            return jsonify({'symbols': []}), 200
        
        # Popular symbols for demo
        popular_symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
            'AMD', 'INTC', 'CRM', 'ADBE', 'PYPL', 'UBER', 'SPOT', 'ZOOM'
        ]
        
        # Filter by query
        matching_symbols = [symbol for symbol in popular_symbols if query in symbol]
        
        # Get basic info for matching symbols
        symbols = []
        for symbol in matching_symbols[:10]:  # Limit to 10 results
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                symbols.append({
                    'symbol': symbol,
                    'companyName': info.get('longName', symbol),
                    'sector': info.get('sector', ''),
                    'marketCap': info.get('marketCap')
                })
            except:
                continue
        
        return jsonify({'symbols': symbols}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_data_bp.route('/chart/<symbol>', methods=['GET'])
@jwt_required()
def get_chart_data():
    try:
        symbol = request.view_args['symbol'].upper()
        period = request.args.get('period', '1mo')
        
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        if hist.empty:
            return jsonify({'error': 'No chart data available'}), 404
        
        chart_data = []
        for date, row in hist.iterrows():
            chart_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume'])
            })
        
        return jsonify({'chart': chart_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@market_data_bp.route('/news/<symbol>', methods=['GET'])
@jwt_required()
def get_stock_news():
    try:
        symbol = request.view_args['symbol'].upper()
        limit = int(request.args.get('limit', 10))
        
        ticker = yf.Ticker(symbol)
        news = ticker.news[:limit]
        
        formatted_news = []
        for article in news:
            formatted_news.append({
                'title': article.get('title', ''),
                'summary': article.get('summary', ''),
                'url': article.get('link', ''),
                'publishedAt': article.get('providerPublishTime', 0),
                'provider': article.get('provider', ''),
                'relatedSymbols': article.get('relatedTickers', [])
            })
        
        return jsonify({'news': formatted_news}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
