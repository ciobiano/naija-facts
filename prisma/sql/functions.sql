-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cultural_content 
    SET view_count = view_count + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user streaks
CREATE OR REPLACE FUNCTION calculate_user_streak(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    last_date DATE;
    check_date DATE;
BEGIN
    -- Get the most recent quiz attempt date
    SELECT DATE(created_at) INTO last_date
    FROM quiz_attempts 
    WHERE user_id = user_id_param 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF last_date IS NULL THEN
        RETURN 0;
    END IF;
    
    check_date := last_date;
    
    -- Count consecutive days with quiz attempts
    WHILE EXISTS (
        SELECT 1 FROM quiz_attempts 
        WHERE user_id = user_id_param 
        AND DATE(created_at) = check_date
    ) LOOP
        current_streak := current_streak + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to update user progress
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_progress (
        user_id, 
        category_id, 
        total_questions_attempted,
        correct_answers,
        total_points_earned,
        current_streak,
        last_activity,
        average_score
    )
    SELECT 
        NEW.user_id,
        q.category_id,
        COUNT(*),
        SUM(CASE WHEN NEW.is_correct THEN 1 ELSE 0 END),
        SUM(NEW.points_earned),
        calculate_user_streak(NEW.user_id),
        NOW(),
        AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END)
    FROM quiz_questions q
    JOIN quiz_attempts qa ON qa.question_id = q.id
    WHERE q.id = NEW.question_id
    GROUP BY q.category_id
    ON CONFLICT (user_id, category_id) 
    DO UPDATE SET
        total_questions_attempted = user_progress.total_questions_attempted + 1,
        correct_answers = user_progress.correct_answers + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END),
        total_points_earned = user_progress.total_points_earned + NEW.points_earned,
        current_streak = calculate_user_streak(NEW.user_id),
        last_activity = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 