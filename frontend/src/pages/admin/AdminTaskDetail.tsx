import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { ArrowLeft, Calendar, User, FileText, Download, Trash2, Award } from 'lucide-react';
import { formatDateLong, formatFileSize, getTaskStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const AdminTaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [score, setScore] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task-detail', id],
    queryFn: () => taskService.getTaskById(id!),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: ({ taskId, score }: { taskId: string; score: number }) =>
      taskService.completeTask(taskId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Task completed and score assigned!');
      setShowScoreModal(false);
      setScore('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete task');
    },
  });

  const resetScoreMutation = useMutation({
    mutationFn: (taskId: string) => taskService.resetScore(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Score reset successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset score');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Task deleted successfully!');
      navigate('/admin/tasks');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });

  const handleCompleteTask = () => {
    const scoreValue = parseInt(score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      toast.error('Please enter a valid score (0-100)');
      return;
    }
    completeMutation.mutate({ taskId: id!, score: scoreValue });
  };

  const handleDeleteTask = () => {
    deleteMutation.mutate(id!);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/tasks')}>
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

        <div className="flex gap-2">
          {task.status !== 'COMPLETED' && (
            <Button onClick={() => setShowScoreModal(true)}>
              <Award className="w-4 h-4 mr-2" />
              Complete & Score
            </Button>
          )}
          {task.status === 'COMPLETED' && task.score !== null && (
            <Button
              variant="outline"
              onClick={() => resetScoreMutation.mutate(id!)}
              isLoading={resetScoreMutation.isPending}
            >
              Reset Score
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
          {/* Assigned User */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Assigned To</h2>
            <div className="flex items-center">
              {task.assignedUser.avatar ? (
                <img
                  src={task.assignedUser.avatar}
                  alt={task.assignedUser.name || ''}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {task.assignedUser.name || task.assignedUser.email}
                </p>
                <p className="text-sm text-gray-500">{task.assignedUser.email}</p>
                <p className="text-sm text-blue-600 mt-1">Score: {task.assignedUser.score}</p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
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
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-sm text-gray-500">{formatDateLong(task.completedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Task & Assign Score</h2>
            <p className="text-gray-600 mb-4">
              Assign a score (0-100) for this task completion. This will be added to the user's total score.
            </p>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score (0-100)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleCompleteTask}
                isLoading={completeMutation.isPending}
              >
                Complete Task
              </Button>
              <Button variant="outline" onClick={() => setShowScoreModal(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Task</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDeleteTask}
                isLoading={deleteMutation.isPending}
              >
                Delete Task
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
