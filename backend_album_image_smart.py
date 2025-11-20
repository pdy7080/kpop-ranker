"""
Album Image Smart API - 로컬 우선 통합 버전
LocalImageManager 완전 통합
"""

from flask import Blueprint, send_from_directory, jsonify, send_file, make_response, redirect
import os
import json
from pathlib import Path
import logging
from urllib.parse import unquote
import sqlite3
import re

# 로거 설정
logger = logging.getLogger(__name__)

# 🆕 로컬 이미지 시스템
try:
    from local_image_manager import get_image_manager
    LOCAL_IMAGE_ENABLED = True
except ImportError:
    LOCAL_IMAGE_ENABLED = False
    logger.warning("LocalImageManager 없음 - 로컬 이미지 시스템 비활성화")

album_image_bp = Blueprint('album_image_smart', __name__)

def get_db_connection():
    """DB 연결"""
    try:
        base_path = Path(__file__).parent.parent
        db_path = base_path / 'rank_history.db'
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"DB 연결 실패: {e}")
        return None

@album_image_bp.route('/api/album-image-smart/<artist>/<track>')
def get_album_image_smart(artist, track):
    """Smart Image API - 로컬 우선 + 고화질 지원"""

    try:
        # 🆕 size 파라미터 처리 (고화질 지원)
        from flask import request
        size = request.args.get('size', '640', type=int)

        # URL 디코딩
        artist = unquote(artist)
        track = unquote(track)

        logger.info(f"이미지 요청: {artist} - {track} (size={size})")
        
        base_path = Path(__file__).parent.parent
        
        # 🆕 LocalImageManager 사용 (활성화된 경우)
        if LOCAL_IMAGE_ENABLED:
            image_manager = get_image_manager()
            local_path = image_manager.get_local_path(artist, track)
            
            if local_path and local_path.exists():
                logger.info(f"로컬 이미지 사용: {local_path.name}")
                return send_from_directory(
                    local_path.parent,
                    local_path.name,
                    mimetype='image/jpeg'
                )
        
        # 1. track_images 매핑 확인 (폴백)
        mapping_path = base_path / 'static' / 'track_images' / 'download_mapping.json'
        
        if mapping_path.exists():
            try:
                with open(mapping_path, 'r', encoding='utf-8') as f:
                    mapping = json.load(f)
                
                # 다양한 키 형식 시도
                keys_to_try = [
                    f"{artist}:{track}",
                    f"{artist.replace(' ', '_')}:{track.replace(' ', '_')}",
                    f"{artist}:{track.split('(')[0].strip()}",  # feat. 제거
                ]
                
                for key in keys_to_try:
                    if key in mapping:
                        filename = mapping[key]
                        image_path = base_path / 'static' / 'track_images' / filename
                        
                        if image_path.exists():
                            logger.info(f"매핑 이미지 발견: {filename}")
                            return send_from_directory(
                                base_path / 'static' / 'track_images',
                                filename,
                                mimetype='image/jpeg'
                            )
            except Exception as e:
                logger.error(f"매핑 파일 읽기 에러: {e}")
        
        # 2. DB에서 찾기
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                
                # 정확한 매칭
                cursor.execute("""
                    SELECT local_image, image_url
                    FROM unified_master_with_images
                    WHERE unified_artist = ?
                    AND unified_track = ?
                    ORDER BY created_at DESC
                    LIMIT 1
                """, (artist, track))
                
                result = cursor.fetchone()
                
                # 부분 매칭 시도
                if not result:
                    base_track = track.split('(')[0].strip()
                    cursor.execute("""
                        SELECT local_image, image_url
                        FROM unified_master_with_images
                        WHERE unified_artist LIKE ?
                        AND unified_track LIKE ?
                        ORDER BY created_at DESC
                        LIMIT 1
                    """, (f'%{artist}%', f'%{base_track}%'))
                    
                    result = cursor.fetchone()
                
                conn.close()
                
                if result:
                    # local_image 확인
                    if result['local_image']:
                        local_path = base_path / 'static' / 'track_images' / result['local_image']
                        if local_path.exists():
                            logger.info(f"DB 로컬 이미지: {result['local_image']}")
                            return send_from_directory(
                                local_path.parent,
                                local_path.name,
                                mimetype='image/jpeg'
                            )
                    
                    # image_url로 폴백
                    if result['image_url']:
                        # 🆕 size에 따라 CDN 이미지 크기 선택
                        upgraded_url = result['image_url']

                        # Melon CDN 처리 (구형 + 신형)
                        if 'melon.co.kr' in upgraded_url:
                            if size >= 640:
                                # 고화질: 1000x1000
                                upgraded_url = upgraded_url.replace('_500.jpg', '_1000.jpg')
                                upgraded_url = upgraded_url.replace('/resize/500/', '/resize/1000/')
                            else:
                                # 중화질: 500x500
                                upgraded_url = upgraded_url.replace('_1000.jpg', '_500.jpg')
                                upgraded_url = upgraded_url.replace('/resize/1000/', '/resize/500/')

                        # 🆕 Bugs CDN 처리 (image.bugsm.co.kr)
                        elif 'image.bugsm.co.kr' in upgraded_url:
                            if size >= 640:
                                # 고화질: /images/500/
                                upgraded_url = upgraded_url.replace('/images/50/', '/images/500/')
                                upgraded_url = upgraded_url.replace('/images/100/', '/images/500/')
                            else:
                                # 중화질: /images/500/
                                upgraded_url = upgraded_url.replace('/images/50/', '/images/500/')
                                upgraded_url = upgraded_url.replace('/images/100/', '/images/500/')
                                upgraded_url = upgraded_url.replace('/images/1000/', '/images/500/')

                        # 🆕 Genie CDN 처리 (image.genie.co.kr)
                        # Genie는 이미 600x600으로 고화질이므로 별도 처리 불필요
                        elif 'image.genie.co.kr' in upgraded_url:
                            pass  # 이미 600x600으로 충분한 화질

                        # 🆕 LocalImageManager로 다운로드 예약
                        if LOCAL_IMAGE_ENABLED:
                            image_manager.queue_download(artist, track, upgraded_url)
                            logger.info(f"다운로드 예약: {artist} - {track}")

                        # 고화질 URL로 리다이렉트
                        return redirect(upgraded_url)
                
            except Exception as e:
                logger.error(f"DB 조회 에러: {e}")
                if conn:
                    conn.close()
        
        # 3. 파일명 기반 직접 매칭 시도
        track_images_dir = base_path / 'static' / 'track_images'
        if track_images_dir.exists():
            # 안전한 파일명 생성
            safe_artist = re.sub(r'[<>:"/\\|?*]', '_', artist)[:50]
            safe_track = re.sub(r'[<>:"/\\|?*]', '_', track)[:50]
            
            # 다양한 패턴 시도
            patterns = [
                f"{safe_artist}_{safe_track}_*.jpg",
                f"{safe_artist.replace(' ', '_')}_{safe_track.replace(' ', '_')}_*.jpg",
                f"{artist}_{track}_*.jpg",
            ]
            
            for pattern in patterns:
                matches = list(track_images_dir.glob(pattern))
                if matches:
                    logger.info(f"직접 매칭: {matches[0].name}")
                    return send_from_directory(
                        track_images_dir,
                        matches[0].name,
                        mimetype='image/jpeg'
                    )
        
        # 4. album_images 폴백 (구 시스템)
        album_images_dir = base_path / 'static' / 'album_images'
        if album_images_dir.exists():
            for img_file in album_images_dir.glob("*.jpg"):
                if artist.lower() in img_file.stem.lower() and track.lower() in img_file.stem.lower():
                    logger.info(f"구 시스템 이미지: {img_file.name}")
                    return send_from_directory(
                        album_images_dir,
                        img_file.name,
                        mimetype='image/jpeg'
                    )
        
        # 5. 🆕 Spotify API 호출 (마지막 폴백)
        logger.info(f"로컬/DB에 이미지 없음, Spotify API 호출: {artist} - {track}")
        try:
            import requests
            import os

            # Spotify Token 가져오기
            client_id = os.getenv('SPOTIFY_CLIENT_ID')
            client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

            if client_id and client_secret:
                # Token 발급
                token_response = requests.post(
                    'https://accounts.spotify.com/api/token',
                    data={'grant_type': 'client_credentials'},
                    auth=(client_id, client_secret),
                    timeout=10
                )

                if token_response.status_code == 200:
                    token = token_response.json()['access_token']

                    # 트랙 검색
                    search_response = requests.get(
                        'https://api.spotify.com/v1/search',
                        headers={'Authorization': f'Bearer {token}'},
                        params={
                            'q': f'artist:{artist} track:{track}',
                            'type': 'track',
                            'limit': 1
                        },
                        timeout=10
                    )

                    if search_response.status_code == 200:
                        data = search_response.json()
                        tracks = data.get('tracks', {}).get('items', [])

                        if tracks and tracks[0].get('album', {}).get('images'):
                            images = tracks[0]['album']['images']
                            # size에 따라 이미지 선택
                            if size >= 640 and len(images) > 0:
                                image_url = images[0]['url']  # 640x640
                            elif size >= 300 and len(images) > 1:
                                image_url = images[1]['url']  # 300x300
                            else:
                                image_url = images[0]['url'] if images else None

                            if image_url:
                                logger.info(f"Spotify API에서 이미지 발견: {artist} - {track}")
                                return redirect(image_url)
        except Exception as e:
            logger.error(f"Spotify API 호출 에러: {e}")

        # 이미지 없음 - 기본 이미지로 redirect (404 대신)
        logger.warning(f"모든 방법 실패, 기본 이미지 사용: {artist} - {track}")
        # Frontend에서 기본 이미지 URL을 사용하도록 redirect
        return redirect('/images/default-album.svg')
        
    except Exception as e:
        logger.error(f"이미지 API 에러: {e}")
        return jsonify({'error': str(e)}), 500

@album_image_bp.route('/api/image-stats')
def get_image_stats():
    """이미지 시스템 통계"""
    try:
        stats = {}
        
        # 로컬 이미지 통계
        if LOCAL_IMAGE_ENABLED:
            image_manager = get_image_manager()
            stats = image_manager.get_stats()
        else:
            # 수동 통계
            base_path = Path(__file__).parent.parent
            track_images_dir = base_path / 'static' / 'track_images'
            
            if track_images_dir.exists():
                image_files = list(track_images_dir.glob("*.jpg"))
                total_size = sum(f.stat().st_size for f in image_files)
                
                mapping_file = track_images_dir / 'download_mapping.json'
                mapping_count = 0
                if mapping_file.exists():
                    with open(mapping_file, 'r', encoding='utf-8') as f:
                        mapping = json.load(f)
                        mapping_count = len(mapping)
                
                stats = {
                    'total_images': len(image_files),
                    'total_mappings': mapping_count,
                    'disk_usage_mb': round(total_size / (1024 * 1024), 2),
                    'local_image_system': False
                }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
