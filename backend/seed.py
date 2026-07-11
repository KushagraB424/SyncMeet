import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, Base
from models import models

# Ensure tables exist
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

TOPICS = [
    "Project Sync", "Design Review", "Sprint Planning", "Client Catchup",
    "Q3 Roadmap", "Backend Architecture", "Frontend Bug Triage",
    "Marketing Sync", "1:1 Review", "All Hands", "Product Demo",
    "Code Review Session", "Standup", "Retrospective", "Onboarding Call"
]

HOSTS = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank"]

DESCRIPTIONS = [
    "Weekly sync to discuss progress and blockers",
    "Reviewing latest design iterations",
    "Planning tasks for the next sprint cycle",
    "Catching up with the client on deliverables",
    "Discussing the product roadmap for Q3",
    "Deep dive into backend service architecture",
    "Triaging and prioritizing frontend bugs",
    "Aligning marketing efforts with product launches",
    "One-on-one performance and growth review",
    "Company-wide update and announcements",
    None, None, None  # Some meetings have no description
]


def seed_db(force: bool = False):
    """Seed the database with realistic dummy meetings.
    
    Args:
        force: If True, clears existing data and re-seeds.
               If False, only seeds if the database is empty.
    """
    db: Session = SessionLocal()
    
    existing_count = db.query(models.Meeting).count()
    if existing_count > 0 and not force:
        db.close()
        return  # Database already has data, skip seeding
    
    # Clear existing data
    db.query(models.MeetingHistory).delete()
    db.query(models.Participant).delete()
    db.query(models.Meeting).delete()
    
    now = datetime.now(timezone.utc)
    meetings = []
    
    # ── Past meetings (10): spread over the last 14 days ──
    for i in range(10):
        days_ago = random.randint(1, 14)
        hours_ago = random.randint(1, 12)
        duration = random.choice([15, 30, 45, 60])
        st = now - timedelta(days=days_ago, hours=hours_ago)
        meetings.append(
            models.Meeting(
                meeting_code=str(uuid.uuid4())[:8],
                title=random.choice(TOPICS),
                description=random.choice(DESCRIPTIONS),
                created_at=st - timedelta(hours=random.randint(1, 24)),
                scheduled_time=st,
                duration=duration,
                host_name=random.choice(HOSTS),
                status="ended"
            )
        )
    
    # ── Today meetings (3-4): guaranteed to be in the future ──
    # These are always 1-6 hours from now, so no matter when the
    # server starts (even at 20:00), there will be meetings "today".
    for offset_hours in [1, 2, 4, 6]:
        st = now + timedelta(hours=offset_hours, minutes=random.randint(0, 30))
        duration = random.choice([15, 30, 45, 60])
        meetings.append(
            models.Meeting(
                meeting_code=str(uuid.uuid4())[:8],
                title=random.choice(TOPICS),
                description=random.choice(DESCRIPTIONS),
                created_at=now - timedelta(hours=random.randint(1, 12)),
                scheduled_time=st,
                duration=duration,
                host_name=random.choice(HOSTS),
                status="scheduled"
            )
        )
    
    # ── Future meetings (10): spread over the next 1-14 days ──
    for i in range(10):
        days_ahead = random.randint(1, 14)
        hours_ahead = random.randint(0, 12)
        duration = random.choice([15, 30, 45, 60])
        st = now + timedelta(days=days_ahead, hours=hours_ahead)
        meetings.append(
            models.Meeting(
                meeting_code=str(uuid.uuid4())[:8],
                title=random.choice(TOPICS),
                description=random.choice(DESCRIPTIONS),
                created_at=now - timedelta(hours=random.randint(1, 48)),
                scheduled_time=st,
                duration=duration,
                host_name=random.choice(HOSTS),
                status="scheduled"
            )
        )
    
    # ── Persist everything ──
    for m in meetings:
        db.add(m)
        db.commit()
        db.refresh(m)
        
        # Add creation history
        db.add(models.MeetingHistory(
            meeting_id=m.id, action="created", timestamp=m.created_at
        ))
        
        # Add participants + end history for past meetings
        if m.status == "ended":
            participant_count = random.randint(1, 3)
            used_hosts = [m.host_name]
            for _ in range(participant_count):
                name = random.choice([h for h in HOSTS if h not in used_hosts] or HOSTS)
                used_hosts.append(name)
                db.add(models.Participant(
                    meeting_id=m.id,
                    participant_name=name,
                    joined_at=m.scheduled_time + timedelta(minutes=random.randint(0, 5)),
                    left_at=m.scheduled_time + timedelta(minutes=m.duration)
                ))
                db.add(models.MeetingHistory(
                    meeting_id=m.id,
                    action=f"participant_joined: {name}",
                    timestamp=m.scheduled_time + timedelta(minutes=random.randint(0, 5))
                ))
            db.add(models.MeetingHistory(
                meeting_id=m.id, action="ended",
                timestamp=m.scheduled_time + timedelta(minutes=m.duration)
            ))
            
    db.commit()
    db.close()
    print(f"Database seeded with {len(meetings)} meetings!")


if __name__ == "__main__":
    seed_db(force=True)
