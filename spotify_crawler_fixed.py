"""
Spotify Chart Crawler - 이미지 URL 추출 기능 추가 + 인코딩 수정
"""

import requests
from bs4 import BeautifulSoup
import logging
from datetime import datetime
import json
import base64

logger = logging.getLogger(__name__)

class SpotifyCrawler:
    """Spotify 크롤러 - 이미지 URL 포함, 인코딩 문제 해결"""

    def __init__(self):
        self.chart_name = "Spotify"
        # Spotify API 자격 증명
        self.client_id = "def57b0f612745f0a746d760f28ac309"
        self.client_secret = "35b9db31ce2a47f9b2a87f8c5fb7aa61"
        self.token = None
        self.token_expires = 0

        # 웹 스크래핑용 URL
        self.charts_url = "https://charts.spotify.com/charts/view/regional-kr-daily/latest"
        self.kworb_url = "https://kworb.net/spotify/country/kr_daily.html"

        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    def get_access_token(self):
        """Spotify API 액세스 토큰 획득"""
        try:
            auth_url = 'https://accounts.spotify.com/api/token'

            client_creds = f"{self.client_id}:{self.client_secret}"
            client_creds_b64 = base64.b64encode(client_creds.encode()).decode()

            headers = {
                'Authorization': f'Basic {client_creds_b64}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            data = {
                'grant_type': 'client_credentials'
            }

            response = requests.post(auth_url, headers=headers, data=data, timeout=10)

            if response.status_code == 200:
                token_data = response.json()
                self.token = token_data['access_token']
                self.token_expires = datetime.now().timestamp() + token_data['expires_in']
                logger.info("Spotify token obtained")
                return True
            else:
                logger.warning(f"Failed to get token: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"Token error: {e}")
            return False

    def crawl_with_api(self):
        """Spotify API를 사용한 크롤링 - 이미지 URL 포함 + 인코딩 수정"""
        try:
            # 토큰 확인
            if not self.token or datetime.now().timestamp() >= self.token_expires:
                if not self.get_access_token():
                    return None

            headers = {
                'Authorization': f'Bearer {self.token}'
            }

            # 여러 플레이리스트 ID 시도
            playlist_ids = [
                '37i9dQZEVXbNxXF4SkHj9F',  # Top 50 - South Korea
                '37i9dQZEVXbJZGli0rRP3r',  # Viral 50 - South Korea
                '37i9dQZF1DX9tPFwDMOaN1',  # K-Pop Daebak
                '37i9dQZF1DX0h0QnLkMBl4'   # K-Pop Rising
            ]

            for playlist_id in playlist_ids:
                try:
                    url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks'
                    params = {
                        'limit': 50,
                        'fields': 'items(track(name,artists,album(name,images),popularity,external_urls))'
                    }

                    response = requests.get(url, headers=headers, params=params, timeout=10)

                    if response.status_code == 200:
                        data = response.json()
                        tracks = []

                        for idx, item in enumerate(data.get('items', []), 1):
                            if item and item.get('track'):
                                track = item['track']

                                # 아티스트 이름 결합
                                artists = ', '.join([
                                    artist['name'] for artist in track.get('artists', [])
                                ])

                                # 이미지 URL 추출
                                image_url = None
                                try:
                                    album_images = track.get('album', {}).get('images', [])
                                    if album_images:
                                        # 가장 큰 이미지 선택 (첫 번째가 보통 가장 큼)
                                        image_url = album_images[0]['url']
                                        # 중간 크기 이미지가 있으면 사용
                                        for img in album_images:
                                            if img.get('width') == 640 or img.get('height') == 640:
                                                image_url = img['url']
                                                break
                                except:
                                    pass

                                # 🆕 normalize_encoding 제거 - 원본 UTF-8 그대로 사용
                                track_name = track.get('name', '')
                                album_name = track.get('album', {}).get('name', '')

                                tracks.append({
                                    'rank': idx,
                                    'title': track_name,
                                    'artist': artists,
                                    'track': track_name,
                                    'album': album_name,
                                    'image_url': image_url,
                                    'chart_name': 'Spotify',
                                    'crawled_at': datetime.now().isoformat(),
                                    'source': 'api'
                                })

                        # 추가 50개 가져오기
                        if len(tracks) == 50:
                            params['offset'] = 50
                            response2 = requests.get(url, headers=headers, params=params, timeout=10)

                            if response2.status_code == 200:
                                data2 = response2.json()
                                for idx, item in enumerate(data2.get('items', []), 51):
                                    if item and item.get('track'):
                                        track = item['track']
                                        artists = ', '.join([
                                            artist['name'] for artist in track.get('artists', [])
                                        ])

                                        # 이미지 URL 추출
                                        image_url = None
                                        try:
                                            album_images = track.get('album', {}).get('images', [])
                                            if album_images:
                                                image_url = album_images[0]['url']
                                        except:
                                            pass

                                        # 🆕 normalize_encoding 제거
                                        track_name = track.get('name', '')
                                        album_name = track.get('album', {}).get('name', '')

                                        tracks.append({
                                            'rank': idx,
                                            'title': track_name,
                                            'artist': artists,
                                            'track': track_name,
                                            'album': album_name,
                                            'image_url': image_url,
                                            'chart_name': 'Spotify',
                                            'crawled_at': datetime.now().isoformat(),
                                            'source': 'api'
                                        })

                        if len(tracks) >= 30:
                            logger.info(f"Spotify API success: {len(tracks)} tracks")
                            return tracks

                except Exception as e:
                    logger.debug(f"Playlist {playlist_id} failed: {e}")
                    continue

            return None

        except Exception as e:
            logger.error(f"Spotify API error: {e}")
            return None

    def crawl_kworb(self):
        """Kworb 사이트에서 크롤링 (백업)"""
        try:
            response = requests.get(self.kworb_url, headers=self.headers, timeout=10)

            if response.status_code != 200:
                return None

            soup = BeautifulSoup(response.text, 'html.parser')
            tracks = []

            # Kworb 테이블 파싱
            table = soup.find('table')
            if table:
                rows = table.find_all('tr')[1:]  # 헤더 제외

                for row in rows[:100]:
                    cols = row.find_all('td')
                    if len(cols) >= 3:
                        rank = int(cols[0].text.strip())

                        # 아티스트와 곡명 분리
                        artist_track = cols[2].text.strip()
                        if ' - ' in artist_track:
                            artist, title = artist_track.split(' - ', 1)
                        else:
                            artist = 'Unknown'
                            title = artist_track

                        # 🆕 normalize_encoding 제거
                        tracks.append({
                            'rank': rank,
                            'title': title,
                            'artist': artist,
                            'track': title,
                            'image_url': None,
                            'chart_name': 'Spotify',
                            'crawled_at': datetime.now().isoformat(),
                            'source': 'kworb'
                        })

            if len(tracks) >= 30:
                logger.info(f"Kworb success: {len(tracks)} tracks")
                return tracks

            return None

        except Exception as e:
            logger.error(f"Kworb error: {e}")
            return None

    def crawl(self):
        """메인 크롤링 메서드"""
        # 1. API 우선 시도
        tracks = self.crawl_with_api()
        if tracks:
            return tracks

        # 2. Kworb 폴백
        logger.info("API failed, trying Kworb...")
        tracks = self.crawl_kworb()
        if tracks:
            return tracks

        logger.error("All Spotify crawl methods failed")
        return []
