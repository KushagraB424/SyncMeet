export interface Participant {
  id: number;
  meeting_id: number;
  participant_name: string;
  joined_at: string;
  left_at?: string;
}

export interface Meeting {
  id: number;
  meeting_code: string;
  title: string;
  description?: string;
  created_at: string;
  scheduled_time?: string;
  duration?: number;
  host_name: string;
  status: string;
}

export interface MeetingDetail extends Meeting {
  participants: Participant[];
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  scheduled_time?: string;
  duration?: number;
  host_name: string;
}

export interface JoinMeetingInput {
  participant_name: string;
}
