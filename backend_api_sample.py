#!/usr/bin/env python3
"""
KPOP Ranker - 고화질 이미지 지원 API 샘플 코드

이 코드를 백엔드 main.py의 album-image-smart 엔드포인트에 적용하세요.
"""

from flask import Flask, request, redirect, send_file, jsonify
import requests
import os

app = Flask(__name__)

# Spotify API 설정 (기존 코드에서 가져오기)
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')


def get_spotify_token():
    """Spotify Access Token 가져오기"""
    # 기존 코드 유지
    pass


def search_spotify_track(artist, track):
    """Spotify에서 트랙 검색"""
    # 기존 코드 유지
    pass


@app.route('/api/album-image-smart/<artist>/<track>')
def get_album_image_smart(artist, track):
    """
    🆕 고화질 이미지 지원 API 엔드포인트

    Parameters:
        artist: 아티스트 이름
        track: 트랙 제목
        size (query param): 이미지 크기 (300, 640) - 기본값 640

    Returns:
        고화질 앨범 이미지 (리다이렉트 또는 파일)
    """

    # 🆕 size 파라미터 처리 (고화질 지원)
    size = request.args.get('size', '640', type=int)

    try:
        # 1. 로컬 캐시 확인
        local_image_path = f'static/track_images/{artist}_{track}_HQ.jpg'
        if os.path.exists(local_image_path):
            return send_file(local_image_path, mimetype='image/jpeg')

        # 2. Spotify API로 검색
        spotify_data = search_spotify_track(artist, track)

        if not spotify_data or 'album' not in spotify_data:
            # 기본 이미지 반환
            return send_file('static/default-album.svg', mimetype='image/svg+xml')

        # 3. 🆕 size에 따라 적절한 이미지 선택
        images = spotify_data.get('album', {}).get('images', [])

        if not images:
            return send_file('static/default-album.svg', mimetype='image/svg+xml')

        # Spotify 이미지는 보통 3가지 크기로 제공:
        # images[0]: 640x640 (큰 것)
        # images[1]: 300x300 (중간)
        # images[2]: 64x64 (작은 것)

        if size >= 640 and len(images) > 0:
            image_url = images[0]['url']  # 640x640 (고화질)
        elif size >= 300 and len(images) > 1:
            image_url = images[1]['url']  # 300x300 (중화질)
        elif len(images) > 2:
            image_url = images[2]['url']  # 64x64 (저화질)
        else:
            image_url = images[0]['url']  # 기본값 (최대 크기)

        # 4. 이미지 URL로 리다이렉트
        return redirect(image_url)

    except Exception as e:
        print(f"❌ Error fetching image for {artist} - {track}: {str(e)}")
        return send_file('static/default-album.svg', mimetype='image/svg+xml'), 500


# 🆕 스케줄러/크롤러용 함수
def save_high_quality_image(artist, track, db_connection):
    """
    스케줄러에서 호출할 함수 - 항상 고화질 이미지 저장

    Parameters:
        artist: 아티스트 이름
        track: 트랙 제목
        db_connection: DB 연결 객체
    """

    try:
        # 1. Spotify에서 트랙 검색
        spotify_data = search_spotify_track(artist, track)

        if not spotify_data or 'album' not in spotify_data:
            print(f"⚠️  Spotify 데이터 없음: {artist} - {track}")
            return None

        # 2. 🆕 항상 최대 크기 이미지 선택 (640x640)
        images = spotify_data.get('album', {}).get('images', [])

        if not images:
            print(f"⚠️  이미지 없음: {artist} - {track}")
            return None

        # 첫 번째 이미지 = 최대 크기 = 640x640
        image_url = images[0]['url']
        image_size = f"{images[0].get('width', 640)}x{images[0].get('height', 640)}"

        # 3. 이미지 다운로드 (선택사항)
        response = requests.get(image_url, timeout=10)
        if response.status_code == 200:
            # 로컬에 저장
            os.makedirs('static/track_images', exist_ok=True)
            local_path = f'static/track_images/{artist}_{track}_HQ.jpg'

            with open(local_path, 'wb') as f:
                f.write(response.content)

            print(f"✅ 고화질 이미지 저장: {artist} - {track} ({image_size})")

        # 4. DB에 저장
        cursor = db_connection.cursor()
        cursor.execute("""
            INSERT INTO album_images (artist_name, track_title, album_image_url, image_size, image_source)
            VALUES (%s, %s, %s, %s, 'spotify_hq')
            ON DUPLICATE KEY UPDATE
                album_image_url = VALUES(album_image_url),
                image_size = VALUES(image_size),
                updated_at = NOW()
        """, (artist, track, image_url, image_size))
        db_connection.commit()

        return image_url

    except Exception as e:
        print(f"❌ 이미지 저장 실패: {artist} - {track}: {str(e)}")
        return None


# 🆕 기존 이미지 재수집 엔드포인트 (관리자 전용)
@app.route('/api/admin/refresh-images', methods=['POST'])
def refresh_all_images():
    """
    모든 트랙의 이미지를 고화질로 재수집
    (주의: 시간이 오래 걸릴 수 있음)
    """

    # 관리자 인증 확인
    admin_key = request.headers.get('X-Admin-Key')
    if admin_key != os.getenv('ADMIN_SECRET_KEY'):
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        # DB에서 모든 트랙 가져오기
        # (실제 DB 연결 코드로 교체 필요)
        db = get_database_connection()
        cursor = db.cursor()

        cursor.execute("""
            SELECT DISTINCT artist_name, track_title
            FROM tracks
            ORDER BY play_count DESC
            LIMIT 1000
        """)

        tracks = cursor.fetchall()

        # 각 트랙의 이미지 재수집
        success_count = 0
        fail_count = 0

        for artist, track in tracks:
            result = save_high_quality_image(artist, track, db)
            if result:
                success_count += 1
            else:
                fail_count += 1

        return jsonify({
            'status': 'completed',
            'total': len(tracks),
            'success': success_count,
            'failed': fail_count
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)


"""
📝 사용 방법:

1. 기존 main.py를 백업:
   cp main.py main.py.backup

2. 이 파일의 get_album_image_smart() 함수를 기존 main.py에 복사

3. save_high_quality_image() 함수를 스케줄러 코드에 추가

4. 서비스 재시작:
   pm2 restart kpopranker-backend

5. 테스트:
   curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=640"

6. (선택) 기존 이미지 재수집:
   curl -X POST https://api.kpopranker.chargeapp.net/api/admin/refresh-images \
        -H "X-Admin-Key: YOUR_SECRET_KEY"
"""
