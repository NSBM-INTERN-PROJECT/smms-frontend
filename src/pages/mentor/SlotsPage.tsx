import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Video, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';

export default function SlotsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const mockSlots = [
    { id: '1', day: 'Mon', time: '09:00 AM', duration: 30, mode: 'Online', status: 'Open', student: null },
    { id: '2', day: 'Mon', time: '10:00 AM', duration: 45, mode: 'In-Person', status: 'Booked', student: 'John Doe' },
    { id: '3', day: 'Tue', time: '11:00 AM', duration: 30, mode: 'Online', status: 'Completed', student: 'Alice Smith' },
    { id: '4', day: 'Wed', time: '02:00 PM', duration: 60, mode: 'In-Person', status: 'Open', student: null },
    { id: '5', day: 'Wed', time: '04:00 PM', duration: 30, mode: 'Online', status: 'Cancelled', student: 'Bob Johnson' },
    { id: '6', day: 'Thu', time: '09:30 AM', duration: 30, mode: 'Online', status: 'Open', student: null },
    { id: '7', day: 'Fri', time: '01:00 PM', duration: 45, mode: 'In-Person', status: 'Booked', student: 'Charlie Brown' },
    { id: '8', day: 'Fri', time: '03:00 PM', duration: 30, mode: 'Online', status: 'Open', student: null },
    { id: '9', day: 'Sat', time: '10:00 AM', duration: 60, mode: 'Online', status: 'Completed', student: 'Diana Prince' },
    { id: '10', day: 'Sun', time: '02:30 PM', duration: 30, mode: 'Online', status: 'Open', student: null },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'var(--accent-cyan)';
      case 'Booked': return 'var(--accent-amber)';
      case 'Completed': return 'var(--accent-green)';
      case 'Cancelled': return 'var(--accent-red)';
      default: return 'var(--border)';
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: 0 }}>
          <Calendar size={24} color="var(--accent-cyan)" /> Meeting Slots
        </h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Slot
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
        {days.map(day => (
          <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ textAlign: 'center', margin: 0, padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {day}
            </h3>
            {mockSlots.filter(slot => slot.day === day).map(slot => (
              <Card key={slot.id} className="card" style={{ 
                borderLeft: `4px solid ${getStatusColor(slot.status)}`,
                opacity: slot.status === 'Cancelled' ? 0.6 : 1,
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{slot.time}</span>
                  <Badge variant={slot.mode === 'Online' ? 'info' : 'default'} style={{ fontSize: '0.7rem' }}>
                    {slot.mode === 'Online' ? <Video size={10} style={{marginRight: '2px'}}/> : <MapPin size={10} style={{marginRight: '2px'}}/>}
                    {slot.mode}
                  </Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <Clock size={12} /> {slot.duration} min
                </div>
                {slot.student && (
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Student: <span style={{ color: 'var(--text-primary)' }}>{slot.student}</span>
                  </div>
                )}
                <div>
                  <Badge variant={
                    slot.status === 'Open' ? 'info' : 
                    slot.status === 'Booked' ? 'warning' : 
                    slot.status === 'Completed' ? 'success' : 'error'
                  } style={{ fontSize: '0.7rem' }}>
                    {slot.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Meeting Slot">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Date" type="date" />
          <Input label="Time" type="time" />
          <Select 
            label="Duration" 
            options={[
              { label: '15 minutes', value: '15' },
              { label: '30 minutes', value: '30' },
              { label: '45 minutes', value: '45' },
              { label: '60 minutes', value: '60' },
            ]} 
          />
          <Select 
            label="Mode" 
            options={[
              { label: 'Online', value: 'Online' },
              { label: 'In-Person', value: 'In-Person' },
            ]} 
          />
          <Input label="Location / Link" placeholder="e.g. Zoom Link or Room 101" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
