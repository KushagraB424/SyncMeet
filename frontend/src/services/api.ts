import axios from "axios";
import { CreateMeetingInput, JoinMeetingInput, Meeting, MeetingDetail } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

export const meetingsApi = {
  createMeeting: async (data: CreateMeetingInput): Promise<Meeting> => {
    const response = await api.post("/meetings/", data);
    return response.data;
  },
  
  getRecentMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get("/meetings/recent");
    return response.data;
  },
  
  getUpcomingMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get("/meetings/upcoming");
    return response.data;
  },
  
  getMeetingByCode: async (code: string): Promise<MeetingDetail> => {
    const response = await api.get(`/meetings/code/${code}`);
    return response.data;
  },
  
  joinMeeting: async (code: string, data: JoinMeetingInput) => {
    // using query param for code and request body for data as defined in FastAPI
    const response = await api.post(`/meetings/join?code=${code}`, data);
    return response.data;
  },
  
  updateMeetingStatus: async (id: number, status: string): Promise<Meeting> => {
    const response = await api.put(`/meetings/${id}`, { status });
    return response.data;
  }
};
