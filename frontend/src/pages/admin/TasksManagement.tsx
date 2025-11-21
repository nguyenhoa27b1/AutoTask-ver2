import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Plus, Search, Filter } from 'lucide-react';
import { formatDateShort, getTaskStatusColor } from '../../utils/helpers';
import type { TaskStatus } from '../../types';

export const TasksManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tasks', search, statusFilter, page],
    queryFn: () =>
      taskService.getAllTasks({
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase(),
        page,
        limit,
      }),
  });

  const getStatusBadge = (status: TaskStatus) => {
    const color = getTaskStatusColor(status);
    const variant = color === 'yellow' ? 'warning' : color === 'red' ? 'danger' : color === 'green' ? 'success' : 'default';
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (isLoading) {
    return <Loading />;
  }

  const tasks = data?.items || [];
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks Management</h1>
          <p className="text-gray-600 mt-1">Manage all tasks and assignments</p>
        </div>
        <Link to="/admin/tasks/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tasks Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Assigned To</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Deadline</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Score</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {task.assignedUser.avatar ? (
                          <img
                            src={task.assignedUser.avatar}
                            alt={task.assignedUser.name || ''}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-gray-600">
                              {task.assignedUser.name?.[0] || task.assignedUser.email[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {task.assignedUser.name || task.assignedUser.email}
                          </p>
                          <p className="text-xs text-gray-500">{task.assignedUser.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDateShort(task.deadline)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(task.status)}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        {task.score !== null ? task.score : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/tasks/${task.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data?.total || 0)} of {data?.total || 0} tasks
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
