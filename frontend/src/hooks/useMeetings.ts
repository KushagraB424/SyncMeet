import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '../services/api';
import { CreateMeetingInput, JoinMeetingInput } from '../types';

export const useRecentMeetings = () => {
  return useQuery({
    queryKey: ['meetings', 'recent'],
    queryFn: meetingsApi.getRecentMeetings,
  });
};

export const useUpcomingMeetings = () => {
  return useQuery({
    queryKey: ['meetings', 'upcoming'],
    queryFn: meetingsApi.getUpcomingMeetings,
  });
};

export const useMeeting = (code: string) => {
  return useQuery({
    queryKey: ['meetings', code],
    queryFn: () => meetingsApi.getMeetingByCode(code),
    enabled: !!code,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingInput) => meetingsApi.createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
};

export const useJoinMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: JoinMeetingInput }) => 
      meetingsApi.joinMeeting(code, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', variables.code] });
    },
  });
};

export const useEndMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => meetingsApi.updateMeetingStatus(id, "ended"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
};
