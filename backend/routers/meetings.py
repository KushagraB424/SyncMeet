from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database.database import get_db
from models import models
from schemas import schemas

router = APIRouter(
    prefix="/api/meetings",
    tags=["meetings"]
)

@router.post("/", response_model=schemas.MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    meeting_code = str(uuid.uuid4())[:8] # Simple 8-char meeting code
    
    db_meeting = models.Meeting(
        **meeting.model_dump(),
        meeting_code=meeting_code
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    # Log history
    history = models.MeetingHistory(meeting_id=db_meeting.id, action="created")
    db.add(history)
    db.commit()
    
    return db_meeting

@router.get("/recent", response_model=List[schemas.MeetingResponse])
def get_recent_meetings(db: Session = Depends(get_db)):
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    all_meetings = db.query(models.Meeting).order_by(models.Meeting.created_at.desc()).limit(50).all()
    
    recent = []
    for m in all_meetings:
        if m.scheduled_time is None:
            recent.append(m)
        else:
            st = m.scheduled_time.replace(tzinfo=timezone.utc) if m.scheduled_time.tzinfo is None else m.scheduled_time
            duration = m.duration if m.duration else 30
            if st + timedelta(minutes=duration) <= now:
                recent.append(m)
    
    return recent[:10]

@router.get("/upcoming", response_model=List[schemas.MeetingResponse])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    all_scheduled = db.query(models.Meeting).filter(models.Meeting.scheduled_time.isnot(None)).all()
    
    upcoming = []
    for m in all_scheduled:
        st = m.scheduled_time.replace(tzinfo=timezone.utc) if m.scheduled_time.tzinfo is None else m.scheduled_time
        duration = m.duration if m.duration else 30
        if st + timedelta(minutes=duration) > now and m.status != "ended":
            upcoming.append(m)
            
    upcoming.sort(key=lambda x: x.scheduled_time)
    return upcoming[:10]

@router.get("/{meeting_id}", response_model=schemas.MeetingDetailResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.get("/code/{code}", response_model=schemas.MeetingDetailResponse)
def get_meeting_by_code(code: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("/join")
def join_meeting(code: str, participant: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    db_participant = models.Participant(
        meeting_id=meeting.id,
        participant_name=participant.participant_name
    )
    db.add(db_participant)
    db.commit()
    
    # Log history
    history = models.MeetingHistory(meeting_id=meeting.id, action=f"participant_joined: {participant.participant_name}")
    db.add(history)
    db.commit()
    
    return {"message": "Joined successfully", "meeting_code": meeting.meeting_code}

@router.put("/{meeting_id}", response_model=schemas.MeetingResponse)
def update_meeting(meeting_id: int, meeting_update: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    for key, value in meeting_update.model_dump(exclude_unset=True).items():
        setattr(meeting, key, value)
        
    db.commit()
    db.refresh(meeting)
    return meeting
