
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    upload_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_video_path TEXT,
    overall_status TEXT NOT NULL CHECK (overall_status IN ('SAFE', 'UNSAFE')),
    user_email TEXT NOT NULL,
    confidence FLOAT,
    duration_seconds FLOAT,
    total_frames INTEGER,
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    mobile_number TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL,
    frame_number INTEGER NOT NULL,
    activity_label TEXT NOT NULL,
    safety_status TEXT NOT NULL CHECK (safety_status IN ('SAFE', 'UNSAFE')),
    timestamp_seconds FLOAT NOT NULL,
    confidence FLOAT,
    bounding_box JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint
    CONSTRAINT fk_video
        FOREIGN KEY (video_id)
        REFERENCES videos(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_videos_user_email ON videos(user_email);
CREATE INDEX IF NOT EXISTS idx_videos_upload_time ON videos(upload_time DESC);
CREATE INDEX IF NOT EXISTS idx_videos_overall_status ON videos(overall_status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_detections_video_id ON detections(video_id);
CREATE INDEX IF NOT EXISTS idx_detections_frame_number ON detections(frame_number);
CREATE INDEX IF NOT EXISTS idx_detections_activity_label ON detections(activity_label);
CREATE INDEX IF NOT EXISTS idx_detections_safety_status ON detections(safety_status);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON detections(timestamp_seconds);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_detections_video_frame ON detections(video_id, frame_number);
CREATE INDEX IF NOT EXISTS idx_videos_user_status ON videos(user_email, overall_status);

-- ========================================
-- FUNCTION: Update timestamp on record update
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at field
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE OR REPLACE VIEW recent_unsafe_videos AS
SELECT 
    v.id,
    v.filename,
    v.upload_time,
    v.user_email,
    v.confidence,
    COUNT(d.id) as unsafe_detection_count
FROM videos v
LEFT JOIN detections d ON v.id = d.video_id AND d.safety_status = 'UNSAFE'
WHERE v.overall_status = 'UNSAFE'
GROUP BY v.id, v.filename, v.upload_time, v.user_email, v.confidence
ORDER BY v.upload_time DESC;

-- View: Video processing summary
CREATE OR REPLACE VIEW video_summary AS
SELECT 
    v.id,
    v.filename,
    v.upload_time,
    v.overall_status,
    v.user_email,
    COUNT(d.id) as total_detections,
    COUNT(CASE WHEN d.safety_status = 'UNSAFE' THEN 1 END) as unsafe_detections,
    COUNT(CASE WHEN d.safety_status = 'SAFE' THEN 1 END) as safe_detections
FROM videos v
LEFT JOIN detections d ON v.id = d.video_id
GROUP BY v.id, v.filename, v.upload_time, v.overall_status, v.user_email;

-- ========================================
-- COMMENTS for Documentation
-- ========================================

COMMENT ON TABLE videos IS 'Stores metadata for all processed surveillance videos';
COMMENT ON TABLE detections IS 'Stores frame-level activity detections and safety classifications';

COMMENT ON COLUMN videos.id IS 'Unique identifier for each video record';
COMMENT ON COLUMN videos.filename IS 'Original uploaded filename';
COMMENT ON COLUMN videos.upload_time IS 'Timestamp when video was uploaded';
COMMENT ON COLUMN videos.processed_video_path IS 'Path to the AI-processed output video';
COMMENT ON COLUMN videos.overall_status IS 'Overall safety classification: SAFE or UNSAFE';
COMMENT ON COLUMN videos.user_email IS 'Email of the user who uploaded the video';

COMMENT ON COLUMN detections.id IS 'Unique identifier for each detection';
COMMENT ON COLUMN detections.video_id IS 'Reference to parent video';
COMMENT ON COLUMN detections.frame_number IS 'Frame number where activity was detected';
COMMENT ON COLUMN detections.activity_label IS 'Detected activity (e.g., Walking, Fighting, Fire)';
COMMENT ON COLUMN detections.safety_status IS 'Safety classification for this detection';
COMMENT ON COLUMN detections.timestamp_seconds IS 'Video timestamp in seconds where activity occurred';
COMMENT ON COLUMN detections.bounding_box IS 'JSON data for bounding box coordinates [x, y, width, height]';
