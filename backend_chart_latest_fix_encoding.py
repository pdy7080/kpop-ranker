#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
개별 차트 API 수정 - 통합탭과 동일한 이미지 로직 적용 + 인코딩 수정
"""

from flask import Blueprint, jsonify
import sqlite3
from pathlib import Path
import logging
from datetime import datetime
import urllib.parse

logger = logging.getLogger(__name__)

chart_latest_bp = Blueprint('chart_latest', __name__)

def get_db_connection():
    db_path = Path(__file__).parent.parent / 'rank_history.db'
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def fix_double_encoding(text):
    """이중 UTF-8 인코딩 수정"""
    if not text:
        return text

    try:
        # 이미 올바른 문자열이면 그대로 반환
        if all(ord(c) < 128 or ord(c) > 255 for c in text):
            return text

        # 이중 인코딩 패턴 감지 및 수정
        # UTF-8 바이트를 Latin-1로 잘못 디코딩한 경우
        try:
            # Latin-1로 인코딩 후 UTF-8로 디코딩
            fixed = text.encode('latin-1').decode('utf-8')
            return fixed
        except (UnicodeDecodeError, UnicodeEncodeError):
            # 실패하면 원본 반환
            return text

    except Exception as e:
        logger.warning(f"Encoding fix failed for '{text}': {e}")
        return text

def get_image_url(row):
    """통합탭과 동일한 이미지 처리 로직"""

    # 1. local_image 최우선 (고화질)
    if row['local_image'] and row['local_image'] != 'None' and row['local_image'] != '_.jpg':
        # 실제 파일 존재 확인
        image_path = Path(__file__).parent.parent / 'static' / 'track_images' / row['local_image']
        if image_path.exists() and image_path.stat().st_size > 10000:  # 10KB 이상
            return f"/static/track_images/{row['local_image']}"

    # 2. Smart API 사용 (local_image 없을 때)
    artist = fix_double_encoding(row['unified_artist'])
    track = fix_double_encoding(row['unified_track'])

    if artist and track:
        safe_artist = urllib.parse.quote(str(artist).replace('/', '_'))
        safe_track = urllib.parse.quote(str(track).replace('/', '_'))
        return f"/api/album-image-smart/{safe_artist}/{safe_track}"

    # 3. 원본 URL은 최후의 수단 (저화질)
    if row['image_url'] and row['image_url'].startswith('http'):
        return row['image_url']

    # 4. 기본 이미지
    return "/images/default-album.svg"

@chart_latest_bp.route('/api/chart/<chart_name>/latest')
def get_chart_latest(chart_name):
    """개별 차트 최신 데이터 - 통합탭과 동일한 처리 + 인코딩 수정"""

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 최신 데이터 조회 (통합탭과 동일한 쿼리)
        query = """
        WITH latest_update AS (
            SELECT MAX(created_at) as latest_time
            FROM unified_master_with_images
            WHERE chart_name = ?
        )
        SELECT
            unified_artist,
            unified_track,
            rank_position,
            local_image,
            image_url,
            views_or_streams,
            created_at
        FROM unified_master_with_images
        WHERE chart_name = ?
        AND created_at = (SELECT latest_time FROM latest_update)
        ORDER BY rank_position
        LIMIT 100
        """

        cursor.execute(query, (chart_name, chart_name))
        results = cursor.fetchall()

        tracks = []

        for row in results:
            # 통합 필드 사용 + 인코딩 수정
            artist = fix_double_encoding(row['unified_artist'])
            track = fix_double_encoding(row['unified_track'])

            # 통합탭과 동일한 이미지 처리
            image_url = get_image_url(row)

            track_data = {
                'artist': artist,
                'track': track,
                'rank': row['rank_position'],
                'rank_position': row['rank_position'],
                'image_url': image_url,  # 처리된 이미지 URL
                'views': row['views_or_streams'],
                'score': 501 - row['rank_position']
            }
            tracks.append(track_data)

        # 업데이트 시간
        cursor.execute("""
            SELECT MAX(created_at) as last_update
            FROM unified_master_with_images
            WHERE chart_name = ?
        """, (chart_name,))

        update_result = cursor.fetchone()
        last_update = update_result['last_update'] if update_result else None

        return jsonify({
            'success': True,
            'chart': chart_name,
            'tracks': tracks,
            'total': len(tracks),
            'last_update': last_update,
            'message': f'{len(tracks)} tracks loaded'
        })

    except Exception as e:
        logger.error(f"Error in chart_latest for {chart_name}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'chart': chart_name,
            'tracks': []
        }), 500

    finally:
        if conn:
            conn.close()

@chart_latest_bp.route('/api/chart/<chart_name>/info')
def get_chart_info(chart_name):
    """차트 정보 및 상태"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 차트 통계
        cursor.execute("""
            SELECT
                COUNT(*) as total_tracks,
                COUNT(DISTINCT unified_artist) as unique_artists,
                COUNT(local_image) as tracks_with_local_image,
                MAX(created_at) as last_update
            FROM unified_master_with_images
            WHERE chart_name = ?
        """, (chart_name,))

        result = cursor.fetchone()

        if result:
            return jsonify({
                'success': True,
                'chart': chart_name,
                'stats': {
                    'total_tracks': result['total_tracks'],
                    'unique_artists': result['unique_artists'],
                    'tracks_with_images': result['tracks_with_local_image'],
                    'last_update': result['last_update']
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No data found'
            }), 404

    except Exception as e:
        logger.error(f"Error in chart_info for {chart_name}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

    finally:
        if conn:
            conn.close()
