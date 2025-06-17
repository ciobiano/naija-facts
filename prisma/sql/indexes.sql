-- Performance indexes for common queries

-- User-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active ON profiles(is_active) WHERE is_active = true;

-- Quiz-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_question ON quiz_attempts(question_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_created ON quiz_attempts(created_at);

-- Progress and gamification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_category ON user_progress(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_points ON user_progress(total_points_earned DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaderboards_period ON leaderboards(period_type, period_start);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank_position);

-- Session and analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_start ON user_sessions(session_start);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_text_search 
ON quiz_questions USING gin(to_tsvector('english', question_text));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cultural_content_text_search 
ON cultural_content USING gin(to_tsvector('english', title || ' ' || description));

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_questions_category_difficulty 
ON quiz_questions(category_id, difficulty_level) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cultural_content_category_type 
ON cultural_content(category_id, content_type) WHERE is_active = true; 