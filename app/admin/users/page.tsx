'use client';

import React, { useState } from 'react';
import { mockStore } from '@/lib/mockStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import {
  Search,
  UserPlus,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { Role, UserResponse, UserStatus } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(() => mockStore.getUsers());
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Create User Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.STUDENT);
  const [newDepartment, setNewDepartment] = useState('Software Engineering');

  // Confirmation Modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'lock' | 'unlock' | 'reset';
    user: UserResponse;
  } | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.createUser({
      fullName: newFullName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
      status: UserStatus.ACTIVE,
    });

    setUsers([...mockStore.getUsers()]);
    setIsCreateOpen(false);
    setNewFullName('');
    setNewEmail('');
    setToastMessage(`Account created for ${newFullName}.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleExecuteAction = () => {
    if (!confirmAction) return;
    const { type, user: targetUser } = confirmAction;

    if (type === 'lock' || type === 'unlock') {
      const newStatus = type === 'lock' ? UserStatus.LOCKED : UserStatus.ACTIVE;
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
      );
      setToastMessage(`Account for ${targetUser.fullName} is now ${newStatus}.`);
    } else if (type === 'reset') {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, mustChangePassword: true } : u))
      );
      setToastMessage(`Password reset requirement enforced for ${targetUser.email}.`);
    }

    setConfirmAction(null);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">User Account Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional account management, role assignment, and security credentials control
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors shadow-2xs self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            aria-label="Search accounts by name or email"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          />
        </div>

        <select
          value={roleFilter}
          aria-label="Filter accounts by role"
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
        >
          <option value="ALL">All Roles</option>
          <option value={Role.ADMIN}>Administrators</option>
          <option value={Role.COORDINATOR}>Faculty Coordinators</option>
          <option value={Role.MENTOR}>Mentors</option>
          <option value={Role.STUDENT}>Students</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <caption className="sr-only">Directory of Institutional User Accounts</caption>
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Account Holder</th>
                <th scope="col" className="px-5 py-3.5">Assigned Role</th>
                <th scope="col" className="px-5 py-3.5">Department</th>
                <th scope="col" className="px-5 py-3.5">Account Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                    {searchTerm ? `No users matching "${searchTerm}"` : 'No user accounts found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge type="role" value={u.role} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {u.department || 'General'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          u.status === UserStatus.ACTIVE
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: 'reset', user: u })}
                          title="Force Password Reset on Next Login"
                          aria-label={`Force password reset for ${u.fullName}`}
                          className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors text-xs font-medium inline-flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reset Pass</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              type: u.status === UserStatus.LOCKED ? 'unlock' : 'lock',
                              user: u,
                            })
                          }
                          title={u.status === UserStatus.LOCKED ? 'Unlock Account' : 'Lock Account'}
                          aria-label={`${u.status === UserStatus.LOCKED ? 'Unlock' : 'Lock'} account for ${u.fullName}`}
                          className={`p-1.5 rounded border text-xs font-medium inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors ${
                            u.status === UserStatus.LOCKED
                              ? 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                              : 'border-rose-200 text-rose-800 hover:bg-rose-50'
                          }`}
                        >
                          {u.status === UserStatus.LOCKED ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Unlock</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Lock</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Lock/Unlock and Password Reset */}
      {confirmAction && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction.type === 'lock'
              ? `Lock Account: ${confirmAction.user.fullName}`
              : confirmAction.type === 'unlock'
              ? `Unlock Account: ${confirmAction.user.fullName}`
              : `Force Password Reset: ${confirmAction.user.fullName}`
          }
          description="Please confirm this administrative account operation"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              {confirmAction.type === 'lock'
                ? 'Locking this account will immediately revoke access and terminate any ongoing authentication sessions.'
                : confirmAction.type === 'unlock'
                ? 'Unlocking this account will restore standard institutional sign-in capabilities.'
                : 'The user will be required to choose a new password immediately upon their next authentication attempt.'}
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none shadow-2xs ${
                  confirmAction.type === 'lock'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Create User */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision Master User Account"
        description="Create user profile and grant initial access credentials"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label htmlFor="user-fullname" className="block font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="user-fullname"
              type="text"
              required
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="e.g. Dr. Richard Feynman"
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="user-email" className="block font-semibold text-slate-700">
              Institutional Email
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@smms.edu"
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-role" className="block font-semibold text-slate-700">
                System Role
              </label>
              <select
                id="user-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value={Role.STUDENT}>STUDENT</option>
                <option value={Role.MENTOR}>MENTOR</option>
                <option value={Role.COORDINATOR}>COORDINATOR</option>
                <option value={Role.ADMIN}>ADMIN</option>
              </select>
            </div>

            <div>
              <label htmlFor="user-dept" className="block font-semibold text-slate-700">
                Department
              </label>
              <select
                id="user-dept"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Central Administration">Central Administration</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            A temporary initial password will be assigned and 2FA authentication will be enforced upon first login.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              Provision Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
