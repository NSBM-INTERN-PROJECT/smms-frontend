import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Mail, Plus, Clock, ExternalLink, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface MeetingRequest {
  id: string;
  mentorName: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  meetingLink?: string;
  createdAt: string;
}

const mockRequests: MeetingRequest[] = [
  {
    id: '1',
    mentorName: 'Dr. Jane Smith',
    preferredDate: '2023-11-15',
    preferredTime: '10:00 AM',
    reason: 'Discuss project proposal draft and get feedback on methodology.',
    status: 'Approved',
    meetingLink: '/student/meetings/m1',
    createdAt: '2023-11-10T09:00:00Z'
  },
  {
    id: '2',
    mentorName: 'Dr. Jane Smith',
    preferredDate: '2023-12-05',
    preferredTime: '02:00 PM',
    reason: 'Follow up on midterm report review.',
    status: 'Pending',
    createdAt: '2023-12-01T14:30:00Z'
  },
  {
    id: '3',
    mentorName: 'Dr. Jane Smith',
    preferredDate: '2023-10-20',
    preferredTime: '11:00 AM',
    reason: 'Career guidance and internship opportunities discussion.',
    status: 'Rejected',
    createdAt: '2023-10-18T10:15:00Z'
  }
];

export default function MeetingRequestsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<MeetingRequest[]>(mockRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newReq, setNewReq] = useState({
    mentorId: 'mentor1',
    preferredDate: '',
    preferredTime: '',
    reason: ''
  });

  const handleSubmit = () => {
    if (!newReq.preferredDate || !newReq.preferredTime || !newReq.reason) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    const request: MeetingRequest = {
      id: Date.now().toString(),
      mentorName: 'Dr. Jane Smith',
      preferredDate: newReq.preferredDate,
      preferredTime: newReq.preferredTime,
      reason: newReq.reason,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    setRequests([request, ...requests]);
    setIsModalOpen(false);
    setNewReq({ mentorId: 'mentor1', preferredDate: '', preferredTime: '', reason: '' });
    showToast('Meeting request submitted', 'success');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      case 'Rejected': return <Badge variant="error">Rejected</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          <Mail size={28} style={{ color: 'var(--accent-cyan)' }} /> Meeting Requests
        </h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> New Request
        </Button>
      </div>

      {/* Timeline List */}
      <div className="space-y-6">
        {requests.map(req => (
          <Card key={req.id} className="p-6 transition-all hover:shadow-lg" style={{ borderLeft: '4px solid var(--border)' }}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{req.mentorName}</span>
                  {getStatusBadge(req.status)}
                </div>
                
                <div className="flex items-center gap-4 mt-3" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-1 text-sm"><CalendarIcon size={14}/> {req.preferredDate}</div>
                  <div className="flex items-center gap-1 text-sm"><Clock size={14}/> {req.preferredTime}</div>
                </div>
                
                <div className="mt-4 flex items-start gap-2 bg-black bg-opacity-20 p-3 rounded-md">
                  <FileText size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }}/>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{req.reason}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Requested on {new Date(req.createdAt).toLocaleDateString()}
                </span>
                {req.status === 'Approved' && req.meetingLink && (
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 mt-2 text-cyan-400">
                    <ExternalLink size={14} /> View Meeting
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Meeting Request">
        <div className="space-y-4">
          <Select
            label="Mentor"
            options={[{ label: 'Dr. Jane Smith', value: 'mentor1' }]}
            value={newReq.mentorId}
            onChange={(e) => setNewReq({...newReq, mentorId: e.target.value})}
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Preferred Date"
              value={newReq.preferredDate}
              onChange={(e) => setNewReq({...newReq, preferredDate: e.target.value})}
            />
            <Input
              type="time"
              label="Preferred Time"
              value={newReq.preferredTime}
              onChange={(e) => setNewReq({...newReq, preferredTime: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Reason for Meeting</label>
            <textarea
              className="w-full p-2 rounded-md"
              style={{ 
                background: 'var(--bg-elevated)', 
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                minHeight: '100px'
              }}
              value={newReq.reason}
              onChange={(e) => setNewReq({...newReq, reason: e.target.value})}
              placeholder="Briefly describe what you'd like to discuss..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
