import { useQuery } from '@tanstack/react-query';
import { taskService } from '../../services/task.service';
import { userService } from '../../services/user.service';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateShort } from '../../utils/helpers';
import { Badge } from '../../components/common/Badge';
import type { TaskStatus } from '../../types';

export const AdminDashboard = () => {
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: () => taskService.getAllTasks({ limit: 5 }),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getAllUsers({ limit: 10 }),
  });

  if (tasksLoading || usersLoading) {
    return <Loading />;
  }

  const tasks = tasksData?.items || [];
  const users = usersData?.items || [];

  const stats = {
    totalTasks: tasksData?.total || 0,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
    overdue: tasks.filter((t) => t.status === 'OVERDUE').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    totalUsers: usersData?.total || 0,
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger">Overdue</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
          <Link to="/admin/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Assigned To</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Deadline</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/tasks/${task.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {task.assignedUser.name || task.assignedUser.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDateShort(task.deadline)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(task.status)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {task.score !== null ? task.score : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Users */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
          <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>

        <div className="space-y-3">
          {users
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((user, index) => (
              <div key={user.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-400 w-8">#{index + 1}</span>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || ''} className="w-10 h-10 rounded-full ml-2" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center ml-2">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{user.name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{user.score}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
