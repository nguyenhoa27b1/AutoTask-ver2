import { format, formatDistance } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const formatDateShort = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy');
};

export const formatDateLong = (date: string | Date): string => {
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
};

export const formatRelative = (date: string | Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const getDeadlineStatus = (deadline: string): 'overdue' | 'today' | 'upcoming' => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffInHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 0) return 'overdue';
  if (diffInHours < 24) return 'today';
  return 'upcoming';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};
