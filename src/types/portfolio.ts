/**
 * Portfolio 관련 공통 타입 정의
 */

export interface FavoriteArtist {
    artist_name: string;
    artist_image: string;
    follow_since: string;
    notification_enabled: boolean;
    current_rank?: number;
    rank_change?: number;
    latest_track?: string;
}

export interface NotificationSettings {
    rank_changes: boolean;
    new_releases: boolean;
    chart_updates: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
}

export interface UserPortfolio {
    user_id: string;
    nickname: string;
    profile_image?: string | null;
    favorite_artists: FavoriteArtist[];
    notification_settings: NotificationSettings;
    theme_color: string;
    created_at: string;
    updated_at: string;
}

export interface ThemeColor {
    name: string;
    value: string;
    gradient: string;
}
