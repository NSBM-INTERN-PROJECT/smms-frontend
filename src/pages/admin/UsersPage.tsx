import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Edit, Eye, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { getUsers, createUser, updateUser, User } from '../../api/user.api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '', passwordHash: '', role: 'student' });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(roleFilter === 'All' ? undefined : roleFilter.toLowerCase());
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setCreateModalOpen(false);
      fetchUsers();
      setFormData({ name: '', email: '', passwordHash: '', role: 'student' });
    } catch (error) {
      console.error('Failed to create user', error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, { name: formData.name });
      setEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user', error);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name || '', email: user.email, passwordHash: '', role: user.role });
    setEditModalOpen(true);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      (user.name?.toLowerCase().includes(search.toLowerCase()) || 
       user.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const mentors = users.filter(u => u.role === 'mentor').length;
    const students = users.filter(u => u.role === 'student' || u.role === 'mentee').length;
    const coords = users.filter(u => u.role === 'coordinator').length;
    return { total: users.length, mentors, students, coords };
  }, [users]);

  const columns = [
    { key: 'name', title: 'Name', render: (u: User) => u.name || 'N/A' },
    { key: 'email', title: 'Email', render: (u: User) => u.email },
    { key: 'role', title: 'Role', render: (u: User) => (
      <Badge variant={u.role === 'admin' ? 'error' : u.role === 'mentor' ? 'info' : u.role === 'coordinator' ? 'warning' : 'success'}>
        {u.role.toUpperCase()}
      </Badge>
    )},
    { key: 'status', title: 'Status', render: () => <Badge variant="success">Active</Badge> },
    { key: 'actions', title: 'Actions', render: (u: User) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm" variant="ghost" onClick={() => openEditModal(u)}><Edit size={16} /></Button>
        <Button size="sm" variant="ghost"><Eye size={16} /></Button>
      </div>
    )}
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={32} color="var(--accent-cyan)" />
          <h1 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>User Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input-field" 
              placeholder="Search users..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', height: '36px' }}
            />
          </div>
          <select 
            className="input-field"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', height: '36px', padding: '0 1rem' }}
          >
            {['All', 'Admin', 'Coordinator', 'Mentor', 'Student'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}><Plus size={18} style={{ marginRight: '0.5rem' }} /> Add User</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[
          { label: 'Total Users', value: stats.total, color: 'var(--accent-cyan)' },
          { label: 'Mentors', value: stats.mentors, color: 'var(--accent-amber)' },
          { label: 'Students', value: stats.students, color: 'var(--accent-green)' },
          { label: 'Coordinators', value: stats.coords, color: 'var(--accent-red)' }
        ].map(stat => (
          <Card key={stat.label}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ padding: '1rem' }}>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div> : (
            filteredUsers.length > 0 ? (
              <Table columns={columns} data={filteredUsers} rowKey={(u) => u.id} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found.</div>
            )
          )}
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create User">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <Input label="Password" type="password" value={formData.passwordHash} onChange={e => setFormData({...formData, passwordHash: e.target.value})} required />
          <Select 
            label="Role" 
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Mentor', value: 'mentor' },
              { label: 'Coordinator', value: 'coordinator' },
              { label: 'Admin', value: 'admin' }
            ]} 
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value})} 
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit User">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Email" value={formData.email} disabled />
          <Select 
            label="Role" 
            options={[{ label: formData.role.toUpperCase(), value: formData.role }]} 
            value={formData.role} 
            disabled 
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
