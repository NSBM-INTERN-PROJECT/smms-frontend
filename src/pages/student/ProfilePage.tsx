import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUser, updateUser } from '../../api/user.api';
import { User, UpdateUserDto } from '../../types/user.types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { Edit, Mail, Phone, MapPin, BookOpen, Clock, User as UserIcon, Calendar } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
  profileData?: any;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    department: '',
    studentId: '',
    batch: '',
    address: '',
    emergencyContact: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUser(user.id);
      setProfile(data);
      setEditForm({
        name: data.name || '',
        phone: data.profileData?.phone || '',
        department: data.profileData?.department || '',
        studentId: data.profileData?.studentId || '',
        batch: data.profileData?.batch || '',
        address: data.profileData?.address || '',
        emergencyContact: data.profileData?.emergencyContact || ''
      });
    } catch (error) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      const updateData = {
        name: editForm.name,
        profileData: {
          ...profile.profileData,
          phone: editForm.phone,
          department: editForm.department,
          studentId: editForm.studentId,
          batch: editForm.batch,
          address: editForm.address,
          emergencyContact: editForm.emergencyContact
        }
      };
      const updated = await updateUser(profile.id, updateData);
      setProfile(updated);
      showToast('Profile updated successfully', 'success');
      setIsEditModalOpen(false);
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;
  if (!profile) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Profile not found</div>;

  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="space-y-6">
      {/* Header section with gradient background */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0.75rem' }}>
        <div style={{
          height: '120px',
          background: 'linear-gradient(90deg, rgba(34,211,238,0.2) 0%, rgba(245,158,11,0.2) 100%)'
        }}></div>
        <Card className="rounded-t-none -mt-2">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-12 px-6 pb-6 gap-6">
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', fontWeight: 'bold', color: '#111827',
              border: '4px solid var(--bg-surface)'
            }}>
              {initials}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }} className="text-3xl font-bold mb-1">
                {profile.name || 'Student Name'}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Mail size={16} /> {profile.email}</span>
                <Badge variant="info">Student</Badge>
              </div>
            </div>
            <Button variant="primary" onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2">
              <Edit size={16} /> Edit Profile
            </Button>
          </div>
        </Card>
      </div>

      {/* Activity summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 p-6">
          <div className="p-4 rounded-full" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm font-medium">Meetings Attended</div>
            <div style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">12</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="p-4 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-green)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm font-medium">Reports Submitted</div>
            <div style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">5</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="p-4 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
            <UserIcon size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm font-medium">Mentor</div>
            <div style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Dr. Jane Smith</div>
          </div>
        </Card>
      </div>

      {/* Profile details card */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Full Name</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.name || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Student ID</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.profileData?.studentId || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Department</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.profileData?.department || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Batch / Year</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.profileData?.batch || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Phone</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.profileData?.phone || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Emergency Contact</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.profileData?.emergencyContact || '-'}</span>
            </div>
            <div className="flex flex-col md:col-span-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Address</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile.profileData?.address || '-'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => !isSaving && setIsEditModalOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input 
            label="Full Name" 
            value={editForm.name} 
            onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Student ID" 
              value={editForm.studentId} 
              onChange={(e) => setEditForm({...editForm, studentId: e.target.value})} 
            />
            <Input 
              label="Department" 
              value={editForm.department} 
              onChange={(e) => setEditForm({...editForm, department: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Batch / Year" 
              value={editForm.batch} 
              onChange={(e) => setEditForm({...editForm, batch: e.target.value})} 
            />
            <Input 
              label="Phone" 
              value={editForm.phone} 
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
            />
          </div>
          <Input 
            label="Emergency Contact" 
            value={editForm.emergencyContact} 
            onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})} 
          />
          <Input 
            label="Address" 
            value={editForm.address} 
            onChange={(e) => setEditForm({...editForm, address: e.target.value})} 
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Spinner size="sm" /> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
