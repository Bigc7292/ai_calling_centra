
// PRD v1.3, Sec 2 & 7: Team Management API
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Initialize Supabase admin client for elevated privileges (inviting users)
// Ensure these are set in your environment variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Zod schema for invite validation
const inviteSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

// POST: /api/team/invite - Invite a new user to the team
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // PRD Sec 3: Check user's role for permission
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    return new NextResponse(JSON.stringify({ error: 'Profile not found.' }), { status: 404 });
  }

  if (profile.role !== 'owner' && profile.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Forbidden: You do not have permission to invite users.' }), { status: 403 });
  }
  
  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: 'Invalid request body.', details: parsed.error.flatten() }), { status: 400 });
  }

  const { email } = parsed.data;

  // PRD Sec 2: Use Supabase Auth to send invitation
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    { data: { team_id: profile.team_id, role: 'viewer' } } // Pass team_id and default role in metadata
  );

  if (inviteError) {
    return new NextResponse(JSON.stringify({ error: 'Failed to invite user.', details: inviteError.message }), { status: 500 });
  }

  return NextResponse.json({ message: 'Invitation sent successfully.', data: inviteData });
}

// Zod schema for role update validation
const roleUpdateSchema = z.object({
  userIdToUpdate: z.string().uuid('Invalid user ID.'),
  newRole: z.enum(['admin', 'editor', 'viewer']), // Owner role cannot be assigned
});

// PATCH: /api/team/roles - Update a team member's role
export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Check caller's role for permission
  const { data: callerProfile, error: callerProfileError } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('user_id', user.id)
    .single();

  if (callerProfileError || !callerProfile) {
    return new NextResponse(JSON.stringify({ error: 'Caller profile not found.' }), { status: 404 });
  }

  if (callerProfile.role !== 'owner' && callerProfile.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Forbidden: You do not have permission to update roles.' }), { status: 403 });
  }

  const body = await request.json();
  const parsed = roleUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: 'Invalid request body.', details: parsed.error.flatten() }), { status: 400 });
  }

  const { userIdToUpdate, newRole } = parsed.data;

  // Owners cannot have their role changed by others
  const { data: targetProfile, error: targetProfileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userIdToUpdate)
    .eq('team_id', callerProfile.team_id) // Ensure the target user is on the same team
    .single();

  if (targetProfileError || !targetProfile) {
    return new NextResponse(JSON.stringify({ error: 'Target user not found on this team.' }), { status: 404 });
  }

  if (targetProfile.role === 'owner') {
    return new NextResponse(JSON.stringify({ error: 'Forbidden: The owner role cannot be changed.' }), { status: 403 });
  }

  // Proceed with the update
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('user_id', userIdToUpdate)
    .eq('team_id', callerProfile.team_id); // Final check

  if (updateError) {
    return new NextResponse(JSON.stringify({ error: 'Failed to update role.', details: updateError.message }), { status: 500 });
  }

  return NextResponse.json({ message: 'Role updated successfully.' });
}
