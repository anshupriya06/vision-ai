"""
Database Configuration and ORM Models for VisionSafe
PostgreSQL connection and SQLAlchemy models
"""
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, ForeignKey, BigInteger, CheckConstraint, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
import os
from typing import Optional

# Database connection configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/visionsafe"
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# ========================================
# ORM MODELS
# ========================================

class Video(Base):
    """
    Video model representing processed surveillance videos
    """
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    upload_time = Column(DateTime(timezone=True), default=datetime.utcnow)
    processed_video_path = Column(String)
    overall_status = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    confidence = Column(Float)
    duration_seconds = Column(Float)
    total_frames = Column(Integer)
    file_size_bytes = Column(BigInteger)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to detections
    detections = relationship("Detection", back_populates="video", cascade="all, delete-orphan")

    # Check constraint for status
    __table_args__ = (
        CheckConstraint("overall_status IN ('SAFE', 'UNSAFE')", name='check_video_status'),
    )

    def __repr__(self):
        return f"<Video(id={self.id}, filename={self.filename}, status={self.overall_status})>"


class Detection(Base):
    """
    Detection model representing individual frame-level safety detections
    """
    __tablename__ = "detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(UUID(as_uuid=True), ForeignKey('videos.id', ondelete='CASCADE'), nullable=False)
    frame_number = Column(Integer, nullable=False)
    activity_label = Column(String, nullable=False)
    safety_status = Column(String, nullable=False)
    timestamp_seconds = Column(Float, nullable=False)
    confidence = Column(Float)
    bounding_box = Column(JSONB)
    detected_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationship to video
    video = relationship("Video", back_populates="detections")

    # Check constraint for status
    __table_args__ = (
        CheckConstraint("safety_status IN ('SAFE', 'UNSAFE')", name='check_detection_status'),
    )

    def __repr__(self):
        return f"<Detection(id={self.id}, video_id={self.video_id}, activity={self.activity_label})>"


class UserProfile(Base):
    """
    User profile model for storing user metadata
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True, index=True)
    mobile_number = Column(String)
    bio = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<UserProfile(email={self.email})>"


# ========================================
# DATABASE HELPER FUNCTIONS
# ========================================

def get_db():
    """
    Dependency function to get database session
    Use with FastAPI Depends
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database by creating all tables
    """
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


def drop_db():
    """
    Drop all database tables (use with caution!)
    """
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped")


# ========================================
# CRUD OPERATIONS
# ========================================

class VideoCRUD:
    """CRUD operations for Video model"""
    
    @staticmethod
    def create_video(db, filename: str, user_email: str, overall_status: str, **kwargs):
        """Create a new video record"""
        video = Video(
            filename=filename,
            user_email=user_email,
            overall_status=overall_status,
            **kwargs
        )
        db.add(video)
        db.commit()
        db.refresh(video)
        return video
    
    @staticmethod
    def get_video(db, video_id: uuid.UUID):
        """Get video by ID"""
        return db.query(Video).filter(Video.id == video_id).first()
    
    @staticmethod
    def get_videos_by_user(db, user_email: str, limit: int = 100):
        """Get all videos for a specific user"""
        return db.query(Video).filter(Video.user_email == user_email).order_by(Video.upload_time.desc()).limit(limit).all()
    
    @staticmethod
    def get_unsafe_videos(db, limit: int = 100):
        """Get all unsafe videos"""
        return db.query(Video).filter(Video.overall_status == 'UNSAFE').order_by(Video.upload_time.desc()).limit(limit).all()
    
    @staticmethod
    def update_video(db, video_id: uuid.UUID, **kwargs):
        """Update video record"""
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            for key, value in kwargs.items():
                setattr(video, key, value)
            db.commit()
            db.refresh(video)
        return video
    
    @staticmethod
    def delete_video(db, video_id: uuid.UUID):
        """Delete video record"""
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            db.delete(video)
            db.commit()
            return True
        return False


class DetectionCRUD:
    """CRUD operations for Detection model"""
    
    @staticmethod
    def create_detection(db, video_id: uuid.UUID, frame_number: int, activity_label: str,
                        safety_status: str, timestamp_seconds: float, **kwargs):
        """Create a new detection record"""
        detection = Detection(
            video_id=video_id,
            frame_number=frame_number,
            activity_label=activity_label,
            safety_status=safety_status,
            timestamp_seconds=timestamp_seconds,
            **kwargs
        )
        db.add(detection)
        db.commit()
        db.refresh(detection)
        return detection
    
    @staticmethod
    def get_detections_by_video(db, video_id: uuid.UUID):
        """Get all detections for a specific video"""
        return db.query(Detection).filter(Detection.video_id == video_id).order_by(Detection.frame_number).all()
    
    @staticmethod
    def get_unsafe_detections_by_video(db, video_id: uuid.UUID):
        """Get all unsafe detections for a specific video"""
        return db.query(Detection).filter(
            Detection.video_id == video_id,
            Detection.safety_status == 'UNSAFE'
        ).order_by(Detection.frame_number).all()
    
    @staticmethod
    def bulk_create_detections(db, detections_data: list):
        """Bulk insert multiple detections"""
        detections = [Detection(**data) for data in detections_data]
        db.bulk_save_objects(detections)
        db.commit()
        return len(detections)


class UserProfileCRUD:
    """CRUD operations for UserProfile model"""

    @staticmethod
    def get_profile_by_email(db, email: str):
        return db.query(UserProfile).filter(UserProfile.email == email).first()

    @staticmethod
    def ensure_profile(db, email: str):
        profile = db.query(UserProfile).filter(UserProfile.email == email).first()
        if profile:
            return profile

        profile = UserProfile(email=email)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def upsert_profile(db, email: str, mobile_number: str = None, bio: str = None):
        profile = db.query(UserProfile).filter(UserProfile.email == email).first()
        if profile:
            if mobile_number is not None:
                profile.mobile_number = mobile_number
            if bio is not None:
                profile.bio = bio
        else:
            profile = UserProfile(
                email=email,
                mobile_number=mobile_number,
                bio=bio
            )
            db.add(profile)

        db.commit()
        db.refresh(profile)
        return profile


# ========================================
# EXAMPLE USAGE
# ========================================

if __name__ == "__main__":
    # Initialize database
    init_db()
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Example: Create a video record
        video = VideoCRUD.create_video(
            db=db,
            filename="test_video.mp4",
            user_email="user@example.com",
            overall_status="SAFE",
            confidence=0.92,
            total_frames=300
        )
        print(f"Created video: {video}")
        
        # Example: Create a detection
        detection = DetectionCRUD.create_detection(
            db=db,
            video_id=video.id,
            frame_number=150,
            activity_label="Walking",
            safety_status="SAFE",
            timestamp_seconds=5.0,
            confidence=0.95
        )
        print(f"Created detection: {detection}")
        
        # Query videos by user
        user_videos = VideoCRUD.get_videos_by_user(db, "user@example.com")
        print(f"Found {len(user_videos)} videos for user")
        
    finally:
        db.close()
