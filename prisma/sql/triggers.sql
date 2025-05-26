-- Trigger to increment view count when content interaction is recorded
CREATE TRIGGER trigger_increment_view_count
    AFTER INSERT ON content_interactions
    FOR EACH ROW
    WHEN (NEW.interaction_type = 'view')
    EXECUTE FUNCTION increment_view_count();

-- Trigger to update user progress after quiz attempt
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_quiz_questions_updated_at
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_quiz_answers_updated_at
    BEFORE UPDATE ON quiz_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cultural_content_updated_at
    BEFORE UPDATE ON cultural_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_achievements_updated_at
    BEFORE UPDATE ON achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leaderboards_updated_at
    BEFORE UPDATE ON leaderboards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 