import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { Search, Download, UserPlus, Users, Trash2, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreateUserForm } from '../../types';

export const UsersManagement = () => {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateUserForm>({
    email: '',
    name: '',
    role: 'USER',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => userService.getAllUsers({ search: search || undefined, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserForm) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User created successfully!');
      setShowCreateModal(false);
      setFormData({ email: '', name: '', role: 'USER' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (userId: string) => userService.toggleUserActive(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const handleExport = async () => {
    try {
      const blob = await userService.exportUsers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully!');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all fields');
      return;
    }
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <Loading />;
  }

  const users = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage all users and their permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Score</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || ''}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'No Name'}</p>
                          <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-lg font-bold text-blue-600">{user.score}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActiveMutation.mutate(user.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete user ${user.name || user.email}?`)) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="user@example.com"
              />
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" isLoading={createMutation.isPending}>
                  Create User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
