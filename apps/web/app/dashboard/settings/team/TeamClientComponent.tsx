'use client';

// PRD v1.3, Sec 3 & 7: Interactive Client Component for Team Settings
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission, Profile, UserRole } from '@/lib/rbac-utils'; // Assuming alias @/lib is configured

// Re-define types for client-side usage
type TeamMember = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
};

interface TeamClientComponentProps {
  initialTeamMembers: TeamMember[];
  currentUserProfile: Profile;
}

export default function TeamClientComponent({ initialTeamMembers, currentUserProfile }: TeamClientComponentProps) {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the current user has admin privileges
  const canManageTeam = hasPermission(currentUserProfile, 'admin');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    });

    if (response.ok) {
      alert('Invitation sent successfully!');
      setInviteEmail('');
      // In a real app, you might want to refresh the member list or use a more robust state management
      router.refresh(); 
    } else {
      const res = await response.json();
      setError(res.error || 'Failed to send invitation.');
    }
    setIsLoading(false);
  };

  const handleRoleChange = async (userIdToUpdate: string, newRole: UserRole) => {
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/team/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIdToUpdate, newRole }),
    });

    if (response.ok) {
      alert('Role updated successfully!');
      // Optimistically update the UI or refresh from server
      setTeamMembers(prev => prev.map(m => m.user_id === userIdToUpdate ? { ...m, role: newRole } : m));
    } else {
      const res = await response.json();
      setError(res.error || 'Failed to update role.');
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Invite Section - only for Admins/Owners */}
      {canManageTeam && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">Invite New Member</h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="new.member@example.com"
              className="flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inviteEmail} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {isLoading ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {/* Members List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Team Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {canManageTeam && member.role !== 'owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value as UserRole)}
                        disabled={isLoading}
                        className="p-1 border rounded-md bg-gray-100"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="capitalize px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full">{member.role}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
