#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Ultimate System v21 Final - 크롤러 형식 호환 버전
모든 크롤러 반환 형식과 호환
"""

import schedule
import time
import logging
from datetime import datetime
from pathlib import Path
import sqlite3

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ultimate_system_v21.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class UltimateSystemV21Final:
    """완전 통합 자동화 시스템 - 최종 버전"""

    def __init__(self):
        self.base_path = Path(__file__).parent
        self.raw_db = self.base_path / 'chart_rankings.db'
        self.final_db = self.base_path / 'rank_history.db'

        # 크롤러 설정 (클래스명 포함)
        self.crawler_config = {
            'melon': {'file': 'melon_crawler', 'class': 'MelonCrawler'},     # ← 문제
            'genie': {'file': 'genie_crawler', 'class': 'GenieCrawler'},     # ← 문제
            'bugs': {'file': 'bugs_crawler', 'class': 'BugsCrawler'},       # ← 문제
            'flo': {'file': 'flo_crawler', 'class': 'FLOCrawler'},               # ← 정상
            'spotify': {'file': 'spotify_crawler', 'class': 'SpotifyCrawler'},   # ← 정상
            'apple_music': {'file': 'apple_music_crawler', 'class': 'AppleMusicCrawler'},
            'lastfm': {'file': 'lastfm_crawler', 'class': 'LastFMCrawler'},
            'youtube': {'file': 'youtube_crawler', 'class': 'YouTubeCrawler'}
        }

        logger.info("Ultimate System v21 Final 초기화 완료")

    def ensure_tables(self):
        """필요한 테이블 확인 및 생성"""
        conn = sqlite3.connect(str(self.final_db))
        cursor = conn.cursor()

        # chart_snapshots 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chart_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chart_name TEXT NOT NULL,
                rank_position INTEGER NOT NULL,
                artist TEXT NOT NULL,
                track TEXT NOT NULL,
                album TEXT,
                image_url TEXT,
                views_or_streams TEXT,
                snapshot_time TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_chart_time
            ON chart_snapshots(chart_name, snapshot_time)
        """)

        # chart_metadata 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chart_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chart_name TEXT UNIQUE NOT NULL,
                last_update TIMESTAMP,
                total_tracks INTEGER,
                is_active BOOLEAN DEFAULT 1
            )
        """)

        # unified_master_with_images (UNIQUE 제약 없이)
        cursor.execute("""
            SELECT sql FROM sqlite_master
            WHERE type='table' AND name='unified_master_with_images'
        """)

        schema = cursor.fetchone()
        if not schema or "UNIQUE" in str(schema[0] if schema else "").upper():
            cursor.execute("DROP TABLE IF EXISTS unified_master_with_images")
            cursor.execute("""
                CREATE TABLE unified_master_with_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chart_name TEXT,
                    rank_position INTEGER,
                    unified_artist TEXT,
                    unified_track TEXT,
                    original_artist TEXT,
                    original_track TEXT,
                    image_url TEXT,
                    views_or_streams TEXT,
                    local_image TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_chart_rank
                ON unified_master_with_images(chart_name, rank_position)
            """)

        conn.commit()
        conn.close()

    def run_crawler(self, chart_name):
        """개별 크롤러 실행 - 모든 반환 형식과 호환"""
        try:
            config = self.crawler_config.get(chart_name)
            if not config:
                logger.warning(f"❌ {chart_name}: 설정 없음")
                return False

            logger.info(f"🕷️ {chart_name} 크롤링 시작...")

            # 크롤러 import
            from importlib import import_module
            module = import_module(f'crawlers.{config["file"]}')
            crawler_class = getattr(module, config['class'])
            crawler = crawler_class()

            # 크롤링 실행
            result = crawler.crawl()

            # 반환 형식 처리 (dict 또는 list 모두 지원)
            if isinstance(result, dict):
                # {'data': [...]} 형식
                data = result.get('data', [])
            elif isinstance(result, list):
                # 리스트 직접 반환
                data = result
            else:
                logger.warning(f"❌ {chart_name}: 알 수 없는 반환 형식")
                return False

            if data:
                self.save_to_raw_db(chart_name, data)
                logger.info(f"✅ {chart_name}: {len(data)}개 크롤링 완료")

                # 고화질 이미지 처리 시도
                self.try_high_quality_images(chart_name, data[:10])

                return True
            else:
                logger.warning(f"❌ {chart_name}: 데이터 없음")
                return False

        except Exception as e:
            logger.error(f"❌ {chart_name} 크롤링 실패: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False

    def try_high_quality_images(self, chart_name, data):
        """고화질 이미지 다운로드 시도"""
        try:
            from local_image_manager import get_image_manager
            manager = get_image_manager()

            success = 0
            for item in data:
                if 'image_url' in item and item['image_url']:
                    if manager.download_and_save(
                        item['image_url'],
                        item.get('artist', ''),
                        item.get('track', item.get('title', ''))
                    ):
                        success += 1

            if success > 0:
                logger.info(f"  🖼️ {success}개 고화질 이미지 다운로드")
        except:
            pass  # 실패해도 계속 진행

    def save_to_raw_db(self, chart_name, data):
        """Raw DB에 저장"""
        conn = sqlite3.connect(str(self.raw_db))
        cursor = conn.cursor()

        crawled_at = datetime.now().isoformat()

        for item in data:
            # track 또는 title 사용
            track_name = item.get('track') or item.get('title', '')

            cursor.execute("""
                INSERT INTO raw_chart_data
                (chart_name, rank, title, artist, track, image_url,
                 views_or_streams, streams, crawled_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                chart_name,
                item.get('rank'),
                track_name,
                item.get('artist', ''),
                track_name,
                item.get('image_url', ''),
                item.get('views_or_streams', ''),
                item.get('streams', ''),
                crawled_at
            ))

        conn.commit()
        conn.close()

    def process_to_timeseries(self, chart_name):
        """시계열 처리"""
        logger.info(f"📊 {chart_name} 시계열 처리...")

        conn_raw = sqlite3.connect(str(self.raw_db))
        conn_final = sqlite3.connect(str(self.final_db))

        cursor_raw = conn_raw.cursor()
        cursor_final = conn_final.cursor()

        # 최신 크롤링 가져오기
        cursor_raw.execute("""
            SELECT DISTINCT crawled_at
            FROM raw_chart_data
            WHERE chart_name = ?
            ORDER BY crawled_at DESC
            LIMIT 1
        """, (chart_name,))

        latest_crawl = cursor_raw.fetchone()
        if not latest_crawl:
            conn_raw.close()
            conn_final.close()
            return False

        latest_crawl = latest_crawl[0]
        time_prefix = latest_crawl[:19]

        # 데이터 가져오기
        cursor_raw.execute("""
            SELECT
                rank,
                artist,
                COALESCE(track, title, '') as track_name,
                image_url,
                COALESCE(views_or_streams, streams, '') as views_data
            FROM raw_chart_data
            WHERE chart_name = ?
            AND crawled_at LIKE ?
            ORDER BY rank
        """, (chart_name, time_prefix + '%'))

        tracks = cursor_raw.fetchall()

        # chart_snapshots에 저장
        saved = 0
        for rank, artist, track, image_url, views_data in tracks:
            if not artist or not track:
                continue

            cursor_final.execute("""
                INSERT INTO chart_snapshots
                (chart_name, rank_position, artist, track, album,
                 image_url, views_or_streams, snapshot_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                chart_name,
                rank if rank else saved + 1,
                artist.strip(),
                track.strip(),
                '',
                image_url or '',
                views_data or '',
                latest_crawl
            ))
            saved += 1

        conn_final.commit()

        # metadata 업데이트
        cursor_final.execute("""
            INSERT OR REPLACE INTO chart_metadata
            (chart_name, last_update, total_tracks, is_active)
            VALUES (?, ?, ?, 1)
        """, (chart_name, latest_crawl, saved))

        conn_final.commit()
        logger.info(f"✅ {chart_name}: {saved}개 저장")

        conn_raw.close()
        conn_final.close()

        return saved > 0

    def update_unified_master(self):
        """unified_master 업데이트"""
        logger.info("🔄 unified_master 업데이트...")

        conn = sqlite3.connect(str(self.final_db))
        cursor = conn.cursor()

        # 초기화
        cursor.execute("DELETE FROM unified_master_with_images")

        # 각 차트 최신 데이터 삽입
        for chart_name in self.crawler_config.keys():
            cursor.execute("""
                INSERT INTO unified_master_with_images
                (chart_name, rank_position, unified_artist, unified_track,
                 original_artist, original_track, image_url, views_or_streams, created_at)
                SELECT
                    chart_name,
                    rank_position,
                    artist,
                    track,
                    artist,
                    track,
                    image_url,
                    views_or_streams,
                    snapshot_time
                FROM chart_snapshots
                WHERE chart_name = ?
                AND snapshot_time = (
                    SELECT MAX(snapshot_time)
                    FROM chart_snapshots
                    WHERE chart_name = ?
                )
                ORDER BY rank_position
            """, (chart_name, chart_name))

        conn.commit()

        # 결과 확인
        cursor.execute("""
            SELECT chart_name, COUNT(*), COUNT(DISTINCT unified_track)
            FROM unified_master_with_images
            GROUP BY chart_name
        """)

        for chart, total, unique in cursor.fetchall():
            logger.info(f"  {chart}: {total}개 ({unique}개 고유)")

        conn.close()

    def run_complete_pipeline(self, chart_name=None):
        """완전 파이프라인 실행"""
        logger.info("=" * 60)
        logger.info(f"🚀 파이프라인 실행: {chart_name or '전체'}")
        logger.info("=" * 60)

        # 테이블 확인
        self.ensure_tables()

        # 차트 목록
        charts = [chart_name] if chart_name else list(self.crawler_config.keys())

        success_count = 0
        for chart in charts:
            try:
                # 1. 크롤링
                if self.run_crawler(chart):
                    # 2. 시계열 처리
                    if self.process_to_timeseries(chart):
                        success_count += 1
            except Exception as e:
                logger.error(f"❌ {chart} 실패: {e}")

        # 3. unified_master 업데이트
        if success_count > 0:
            self.update_unified_master()

            # 4. 캐시 갱신
            try:
                from smart_cache_warmer_v3 import SmartCacheWarmer
                cache_warmer = SmartCacheWarmer()
                cache_warmer.warm_all_cache()
                logger.info("✅ 캐시 갱신")
            except:
                pass

        logger.info(f"✅ 완료: {success_count}/{len(charts)} 성공")
        return success_count > 0

def test_mode():
    """테스트 모드"""
    print("=" * 60)
    print("🧪 Ultimate System v21 Final 테스트")
    print("=" * 60)

    system = UltimateSystemV21Final()

    # 멜론 테스트
    success = system.run_complete_pipeline("melon")

    if success:
        print("\n✅ 테스트 성공!")
        print("\n결과 확인:")
        print("python app.py")
        print("curl http://localhost:5000/api/charts/melon")
    else:
        print("\n❌ 테스트 실패")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_mode()
    else:
        system = UltimateSystemV21Final()
        # 초기 실행 (주석 유지)
        # system.run_complete_pipeline()

        # 스케줄 설정 및 실행
        import schedule

        # 스케줄 설정 - 전체 7개 크롤러
        # Melon (4회/일)
        schedule.every().day.at("01:10").do(system.run_complete_pipeline, "melon")
        schedule.every().day.at("07:10").do(system.run_complete_pipeline, "melon")
        schedule.every().day.at("13:10").do(system.run_complete_pipeline, "melon")
        schedule.every().day.at("19:10").do(system.run_complete_pipeline, "melon")

        # Genie (4회/일)
        schedule.every().day.at("01:15").do(system.run_complete_pipeline, "genie")
        schedule.every().day.at("07:15").do(system.run_complete_pipeline, "genie")
        schedule.every().day.at("13:15").do(system.run_complete_pipeline, "genie")
        schedule.every().day.at("19:15").do(system.run_complete_pipeline, "genie")

        # Bugs (4회/일)
        schedule.every().day.at("01:20").do(system.run_complete_pipeline, "bugs")
        schedule.every().day.at("07:20").do(system.run_complete_pipeline, "bugs")
        schedule.every().day.at("13:20").do(system.run_complete_pipeline, "bugs")
        schedule.every().day.at("19:20").do(system.run_complete_pipeline, "bugs")

        # FLO (2회/일)
        schedule.every().day.at("01:25").do(system.run_complete_pipeline, "flo")
        schedule.every().day.at("13:25").do(system.run_complete_pipeline, "flo")

        # Apple Music (1회/일)
        schedule.every().day.at("09:10").do(system.run_complete_pipeline, "apple_music")

        # Spotify (1회/일)
        schedule.every().day.at("10:10").do(system.run_complete_pipeline, "spotify")

        # Last.fm (1회/일)
        schedule.every().day.at("12:10").do(system.run_complete_pipeline, "lastfm")

        logger.info("스케줄러 시작 - 7개 크롤러 등록 완료")
        logger.info("등록된 크롤러: Melon(4회), Genie(4회), Bugs(4회), FLO(2회), Apple(1회), Spotify(1회), Lastfm(1회)")
        logger.info("다음 크롤링: FLO(13:25), Apple(09:10), Spotify(10:10), Lastfm(12:10)")

        # 메인 루프
        while True:
            schedule.run_pending()
            time.sleep(60)
