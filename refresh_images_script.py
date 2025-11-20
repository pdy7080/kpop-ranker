#!/usr/bin/env python3
"""
기존 저화질 이미지를 고화질로 재수집하는 스크립트

사용법:
    python3 refresh_images_script.py

주의사항:
    - Spotify API 호출 제한 있음 (시간당 약 1000회)
    - 전체 이미지 재수집 시 1-2시간 소요 가능
    - 백그라운드 실행 권장: nohup python3 refresh_images_script.py &
"""

import requests
import time
import json
import os
from datetime import datetime


class ImageRefresher:
    def __init__(self, api_url="https://api.kpopranker.chargeapp.net"):
        self.api_url = api_url
        self.spotify_token = None
        self.stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'skipped': 0
        }

    def get_spotify_token(self):
        """Spotify Access Token 가져오기"""
        # 환경 변수에서 credentials 가져오기
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

        if not client_id or not client_secret:
            print("❌ SPOTIFY_CLIENT_ID 또는 SPOTIFY_CLIENT_SECRET이 설정되지 않았습니다")
            return None

        try:
            response = requests.post(
                'https://accounts.spotify.com/api/token',
                data={'grant_type': 'client_credentials'},
                auth=(client_id, client_secret),
                timeout=10
            )

            if response.status_code == 200:
                self.spotify_token = response.json()['access_token']
                print("✅ Spotify Token 발급 성공")
                return self.spotify_token
            else:
                print(f"❌ Token 발급 실패: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ Token 발급 에러: {str(e)}")
            return None

    def search_spotify_track(self, artist, track):
        """Spotify에서 트랙 검색하여 고화질 이미지 URL 가져오기"""

        if not self.spotify_token:
            self.get_spotify_token()

        if not self.spotify_token:
            return None

        try:
            # Spotify Search API 호출
            headers = {'Authorization': f'Bearer {self.spotify_token}'}
            params = {
                'q': f'artist:{artist} track:{track}',
                'type': 'track',
                'limit': 1
            }

            response = requests.get(
                'https://api.spotify.com/v1/search',
                headers=headers,
                params=params,
                timeout=10
            )

            if response.status_code == 401:
                # Token 만료 - 재발급
                self.get_spotify_token()
                headers = {'Authorization': f'Bearer {self.spotify_token}'}
                response = requests.get(
                    'https://api.spotify.com/v1/search',
                    headers=headers,
                    params=params,
                    timeout=10
                )

            if response.status_code != 200:
                print(f"⚠️  Spotify API 오류 ({response.status_code}): {artist} - {track}")
                return None

            data = response.json()
            tracks = data.get('tracks', {}).get('items', [])

            if not tracks:
                print(f"⚠️  검색 결과 없음: {artist} - {track}")
                return None

            # 첫 번째 이미지 = 640x640 (고화질)
            images = tracks[0].get('album', {}).get('images', [])

            if not images:
                print(f"⚠️  이미지 없음: {artist} - {track}")
                return None

            return images[0]['url']  # 최대 크기 이미지

        except Exception as e:
            print(f"❌ 검색 에러: {artist} - {track}: {str(e)}")
            return None

    def get_top_tracks(self):
        """API에서 상위 트랙 목록 가져오기"""

        try:
            response = requests.get(
                f"{self.api_url}/api/trending?limit=100",
                timeout=15
            )

            if response.status_code == 200:
                data = response.json()
                tracks = data.get('trending', [])
                print(f"✅ {len(tracks)}개 트랙 목록 가져오기 성공")
                return tracks
            else:
                print(f"❌ 트랙 목록 가져오기 실패: {response.status_code}")
                return []

        except Exception as e:
            print(f"❌ API 에러: {str(e)}")
            return []

    def refresh_track_image(self, artist, track):
        """단일 트랙 이미지 재수집"""

        print(f"🔄 처리 중: {artist} - {track}")

        # 1. Spotify에서 고화질 이미지 URL 가져오기
        image_url = self.search_spotify_track(artist, track)

        if not image_url:
            self.stats['failed'] += 1
            return False

        # 2. 이미지 다운로드 (선택사항 - DB만 업데이트해도 됨)
        try:
            response = requests.get(image_url, timeout=10)

            if response.status_code == 200:
                # 파일로 저장 (백엔드 서버에서만 가능)
                # 여기서는 URL만 출력
                print(f"✅ 고화질 이미지 URL: {image_url}")
                print(f"   크기: {len(response.content) / 1024:.1f}KB")

                self.stats['success'] += 1
                return True
            else:
                print(f"⚠️  이미지 다운로드 실패: {response.status_code}")
                self.stats['failed'] += 1
                return False

        except Exception as e:
            print(f"❌ 다운로드 에러: {str(e)}")
            self.stats['failed'] += 1
            return False

    def refresh_all(self, limit=None, delay=0.5):
        """
        모든 트랙 이미지 재수집

        Parameters:
            limit: 처리할 최대 트랙 수 (None = 전체)
            delay: 각 요청 사이 딜레이 (초, API 제한 방지)
        """

        print(f"\n{'='*60}")
        print("🚀 이미지 재수집 시작")
        print(f"{'='*60}\n")

        # 1. Spotify Token 발급
        if not self.get_spotify_token():
            print("❌ Spotify Token이 없어서 중단합니다")
            return

        # 2. 트랙 목록 가져오기
        tracks = self.get_top_tracks()

        if not tracks:
            print("❌ 트랙 목록이 없어서 중단합니다")
            return

        # 3. 제한 적용
        if limit:
            tracks = tracks[:limit]

        self.stats['total'] = len(tracks)

        print(f"\n📊 처리할 트랙 수: {len(tracks)}")
        print(f"⏱️  예상 소요 시간: {len(tracks) * delay / 60:.1f}분\n")

        # 4. 각 트랙 처리
        start_time = time.time()

        for idx, track in enumerate(tracks, 1):
            artist = track.get('artist', 'Unknown')
            track_title = track.get('track', 'Unknown')

            print(f"\n[{idx}/{len(tracks)}] ", end='')
            self.refresh_track_image(artist, track_title)

            # API 제한 방지 딜레이
            if idx < len(tracks):
                time.sleep(delay)

            # 진행률 표시
            if idx % 10 == 0:
                elapsed = time.time() - start_time
                progress = idx / len(tracks) * 100
                print(f"\n📊 진행률: {progress:.1f}% ({idx}/{len(tracks)}) - 경과시간: {elapsed/60:.1f}분")

        # 5. 결과 요약
        elapsed_time = time.time() - start_time

        print(f"\n{'='*60}")
        print("✅ 재수집 완료!")
        print(f"{'='*60}")
        print(f"총 처리: {self.stats['total']}")
        print(f"✅ 성공: {self.stats['success']}")
        print(f"❌ 실패: {self.stats['failed']}")
        print(f"⏱️  소요 시간: {elapsed_time/60:.1f}분")
        print(f"{'='*60}\n")

        # 6. 결과 JSON 저장
        result = {
            'timestamp': datetime.now().isoformat(),
            'stats': self.stats,
            'duration_minutes': elapsed_time / 60
        }

        with open('image_refresh_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print("📝 결과 저장: image_refresh_result.json")


def main():
    """메인 함수"""

    print("""
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🎨 KPOP Ranker 이미지 품질 개선 스크립트           ║
║                                                            ║
║   모든 트랙의 이미지를 고화질(640x640)로 재수집합니다      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    """)

    # 환경 변수 확인
    if not os.getenv('SPOTIFY_CLIENT_ID'):
        print("⚠️  환경 변수 설정이 필요합니다:")
        print("   export SPOTIFY_CLIENT_ID='your_client_id'")
        print("   export SPOTIFY_CLIENT_SECRET='your_client_secret'")
        return

    # ImageRefresher 인스턴스 생성
    refresher = ImageRefresher()

    # 옵션 선택
    print("\n선택하세요:")
    print("1. 테스트 (상위 10개만)")
    print("2. 일부 재수집 (상위 100개)")
    print("3. 전체 재수집 (모든 트랙)")

    choice = input("\n선택 (1-3): ").strip()

    if choice == '1':
        print("\n🧪 테스트 모드: 상위 10개 트랙")
        refresher.refresh_all(limit=10, delay=0.5)
    elif choice == '2':
        print("\n📊 일부 모드: 상위 100개 트랙")
        confirm = input("계속하시겠습니까? (y/N): ").strip().lower()
        if confirm == 'y':
            refresher.refresh_all(limit=100, delay=0.5)
    elif choice == '3':
        print("\n🔥 전체 모드: 모든 트랙")
        confirm = input("⚠️  시간이 오래 걸립니다. 계속하시겠습니까? (y/N): ").strip().lower()
        if confirm == 'y':
            refresher.refresh_all(limit=None, delay=0.5)
    else:
        print("❌ 잘못된 선택입니다")


if __name__ == '__main__':
    main()


"""
📝 사용 예시:

1. 환경 변수 설정:
   export SPOTIFY_CLIENT_ID='your_id'
   export SPOTIFY_CLIENT_SECRET='your_secret'

2. 실행:
   python3 refresh_images_script.py

3. 백그라운드 실행:
   nohup python3 refresh_images_script.py > refresh.log 2>&1 &
   tail -f refresh.log

4. 진행 상황 확인:
   cat image_refresh_result.json
"""
