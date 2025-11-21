import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { taskService } from '../../services/task.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateTaskForm } from '../../types';

export const CreateTask = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    assignedUserId: '',
    deadline: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);

  const { data: usersData } = useQuery({
    queryKey: ['users-for-assign'],
    queryFn: () => userService.getAllUsers({ role: 'USER', limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: { formData: CreateTaskForm; files: FileList | null }) => {
      return taskService.createTask(data.formData, data.files || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Task created successfully!');
      navigate('/admin/tasks');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.assignedUserId || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    createMutation.mutate({ formData, files });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const users = usersData?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/tasks')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-600 mt-1">Assign a new task to a user</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter task title"
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Enter task description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Assign User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              name="assignedUserId"
              value={formData.assignedUserId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email} - Score: {user.score}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <Input
            label="Deadline"
            name="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={handleChange}
            required
          />

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attach Files (optional)
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Choose files</span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                />
              </label>
              {files && files.length > 0 && (
                <span className="text-sm text-gray-600">
                  {files.length} file(s) selected
                </span>
              )}
            </div>
            {files && files.length > 0 && (
              <div className="mt-2 space-y-1">
                {Array.from(files).map((file, index) => (
                  <p key={index} className="text-sm text-gray-500">
                    • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Task
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/tasks')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
