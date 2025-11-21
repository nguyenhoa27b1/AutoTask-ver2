import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { ArrowLeft, Calendar, FileText, Download, Clock } from 'lucide-react';
import { formatDateLong, formatFileSize, getTaskStatusColor } from '../../utils/helpers';

export const UserTaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading } = useQuery({
    queryKey: ['user-task-detail', id],
    queryFn: () => taskService.getTaskById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const color = getTaskStatusColor(status);
    const variant = color === 'yellow' ? 'warning' : color === 'red' ? 'danger' : color === 'green' ? 'success' : 'default';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/user/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(task.status)}
            {task.score !== null && (
              <span className="text-sm font-medium text-blue-600">Score: {task.score}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
          </Card>

          {/* Files */}
          {task.files && task.files.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Attached Files</h2>
              <div className="space-y-2">
                {task.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                      </div>
                    </div>
                    <a
                      href={file.filePath}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-500">{formatDateLong(task.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Deadline</p>
                  <p className="text-sm text-gray-500">{formatDateLong(task.deadline)}</p>
                </div>
              </div>

              {task.completedAt && (
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-sm text-gray-500">{formatDateLong(task.completedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Countdown */}
          {task.status !== 'COMPLETED' && (
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Time Remaining</h2>
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  {daysUntilDeadline < 0 ? (
                    <>
                      <p className="text-2xl font-bold text-red-600">
                        {Math.abs(daysUntilDeadline)} days
                      </p>
                      <p className="text-sm text-red-600">Overdue</p>
                    </>
                  ) : daysUntilDeadline === 0 ? (
                    <>
                      <p className="text-2xl font-bold text-yellow-600">Today</p>
                      <p className="text-sm text-yellow-600">Deadline is today!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-blue-600">{daysUntilDeadline} days</p>
                      <p className="text-sm text-gray-600">Until deadline</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Status Info */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Status Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <div className="mt-1">{getStatusBadge(task.status)}</div>
              </div>

              {task.score !== null && (
                <div>
                  <p className="text-sm text-gray-600">Your Score</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{task.score}</p>
                </div>
              )}

              {task.status === 'COMPLETED' && task.score !== null && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-green-800 font-medium">✓ Task completed successfully!</p>
                  <p className="text-xs text-green-700 mt-1">
                    You earned {task.score} points for this task.
                  </p>
                </div>
              )}

              {task.status === 'OVERDUE' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-red-800 font-medium">⚠ This task is overdue</p>
                  <p className="text-xs text-red-700 mt-1">
                    Please complete it as soon as possible.
                  </p>
                </div>
              )}

              {task.status === 'PENDING' && daysUntilDeadline <= 3 && daysUntilDeadline >= 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-yellow-800 font-medium">⏰ Deadline approaching</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Only {daysUntilDeadline} day(s) remaining until the deadline.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
