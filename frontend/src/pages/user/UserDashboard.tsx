import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../../services/task.service';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateShort, getTaskStatusColor } from '../../utils/helpers';
import { Badge } from '../../components/common/Badge';
import { useAuthStore } from '../../store/authStore';
import type { Task } from '../../types';

export const UserDashboard = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<string>('all');

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['user-tasks', filter],
    queryFn: () => taskService.getMyTasks({ 
      status: filter === 'all' ? undefined : filter.toUpperCase(),
      limit: 10 
    }),
  });

  if (isLoading) {
    return <Loading />;
  }

  const tasks = tasksData?.items || [];

  const stats = {
    totalTasks: tasksData?.total || 0,
    pending: tasks.filter((t: Task) => t.status === 'PENDING').length,
    overdue: tasks.filter((t: Task) => t.status === 'OVERDUE').length,
    completed: tasks.filter((t: Task) => t.status === 'COMPLETED').length,
  };

  const getStatusBadge = (status: string) => {
    const color = getTaskStatusColor(status);
    const variant = color === 'yellow' ? 'warning' : color === 'red' ? 'danger' : color === 'green' ? 'success' : 'default';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || user?.email}!</p>
        </div>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3 px-6 py-4">
            <TrendingUp className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">My Score</p>
              <p className="text-3xl font-bold">{user?.score || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* My Tasks */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filter === 'overdue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const daysUntilDeadline = Math.ceil(
                (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <Link key={task.id} to={`/user/tasks/${task.id}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDateShort(task.deadline)}
                          {task.status !== 'COMPLETED' && (
                            <span className={`ml-2 ${daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline <= 3 ? 'text-yellow-600' : ''}`}>
                              ({daysUntilDeadline < 0 ? 'Overdue' : `${daysUntilDeadline} days left`})
                            </span>
                          )}
                        </div>
                        {task.score !== null && (
                          <span className="text-sm font-medium text-blue-600">
                            Score: {task.score}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
