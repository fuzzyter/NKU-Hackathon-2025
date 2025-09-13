# crawl_newsletters.py

import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv  
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['my_database']
# 뉴스레터 정보를 저장할 새로운 컬렉션 'newsletters' 사용
collection = db['newsletters']
print("MongoDB에 성공적으로 연결되었습니다.")

# --- 크롤링 설정 ---
URL = 'https://finance.yahoo.com/newsletters/'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# --- 크롤링 실행 ---
print(f"{URL} 에서 뉴스레터 크롤링을 시작합니다...")

try:
    response = requests.get(URL, headers=HEADERS)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    # 각 뉴스레터 정보를 감싸고 있는 컨테이너 div를 선택합니다.
    # 이 CSS 선택자는 웹사이트 구조 변경 시 달라질 수 있습니다.
    newsletter_containers = soup.select('div[data-component="NewsletterFollow"]')

    if not newsletter_containers:
        print("경고: 뉴스레터 컨테이너를 찾지 못했습니다. 웹사이트 구조가 변경되었을 수 있습니다.")

    crawled_count = 0

    for container in newsletter_containers:
        # 제목 추출 (h2 태그)
        title_element = container.select_one('h2')
        title = title_element.get_text(strip=True) if title_element else "제목 없음"

        # 설명 추출 (p 태그)
        description_element = container.select_one('p')
        description = description_element.get_text(strip=True) if description_element else ""

        # 이미지 URL 추출 (img 태그)
        image_element = container.select_one('img')
        image_url = image_element['src'] if image_element and 'src' in image_element.attrs else ""

        # DB에 저장할 데이터 객체 생성
        newsletter_data = {
            'title': title,
            'description': description,
            'imageUrl': image_url,
            'source': 'Yahoo Finance Newsletter',
            'crawledAt': datetime.now().isoformat()
        }

        # 뉴스레터 제목을 기준으로 중복 확인 및 저장/업데이트
        result = collection.update_one({'title': title}, {'$set': newsletter_data}, upsert=True)

        if result.upserted_id:
            crawled_count += 1
            print(f"  -> 새 뉴스레터 저장: {title}")

    print("-" * 50)
    print(f"크롤링 완료! 총 {crawled_count}개의 새로운 뉴스레터를 저장했습니다.")

except requests.exceptions.RequestException as e:
    print(f"오류 발생: {e}")
except Exception as e:
    print(f"알 수 없는 오류 발생: {e}")

finally:
    client.close()
    print("MongoDB 연결이 종료되었습니다.")