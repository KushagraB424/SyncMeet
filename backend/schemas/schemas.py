from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime, timezone

class ParticipantBase(BaseModel):
    participant_name: str

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: int
    meeting_id: int
    joined_at: datetime
    left_at: Optional[datetime] = None

    @field_validator("joined_at", "left_at", mode="before")
    def ensure_tz(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        if isinstance(v, str) and not v.endswith("Z") and "+" not in v:
            return v + "Z"
        return v

    model_config = ConfigDict(from_attributes=True)

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    duration: Optional[int] = None
    host_name: str

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    status: Optional[str] = None

class MeetingResponse(MeetingBase):
    id: int
    meeting_code: str
    created_at: datetime
    status: str

    @field_validator("created_at", "scheduled_time", mode="before")
    def ensure_tz(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        if isinstance(v, str) and not v.endswith("Z") and "+" not in v:
            return v + "Z"
        return v

    model_config = ConfigDict(from_attributes=True)
    
class MeetingDetailResponse(MeetingResponse):
    participants: List[ParticipantResponse] = []
