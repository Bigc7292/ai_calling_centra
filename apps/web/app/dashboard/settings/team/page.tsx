// PRD v1.3, Sec 3 & 7: Team Settings UI
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TeamClientComponent from './TeamClientComponent'; // Interactive client part

export const dynamic = 'force-dynamic';

// Define types based on our schema
// In a real app, these would be generated from the DB schema (e.g., with `supabase gen types typescript`)
type TeamMember = {
  user_id: string;
  full_name: string | null;
  email: string | null; // Assuming email is stored in profiles
  role: 'owner' | 'admin' | 'editor' | 'viewer';
};

type Profile = {
  role: 'owner' | 'admin' | 'editor' | 'viewer' | null;
  team_id: string | null;
};

async function TeamSettingsPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch the current user's profile to get their team_id and role
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('team_id, role')
    .eq('user_id', session.user.id)
    .single<Profile>();

  if (profileError || !userProfile || !userProfile.team_id) {
    console.error('Error fetching user profile or team ID:', profileError);
    // Render an error state or redirect
    return <div>Error loading your team information. Please try again later.</div>;
  }

  // Fetch all members of the user's team
  const { data: teamMembers, error: membersError } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, role')
    .eq('team_id', userProfile.team_id)
    .returns<TeamMember[]>();

  if (membersError) {
    console.error('Error fetching team members:', membersError);
    return <div>Error loading team members.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Team Management</h1>
      <p className="mb-6 text-gray-600">Manage your team members and their roles.</p>
      <TeamClientComponent 
        initialTeamMembers={teamMembers || []} 
        currentUserProfile={userProfile}
      />
    </div>
  );
}

export default TeamSettingsPage;
