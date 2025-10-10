// Per TASK COMMAND: Backend Express (Next.js API Route) handler
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';

import { SignupApiSchema } from '../../../lib/zod-schemas';

// Per PRD Sec 5: Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 1. Validate request body // Per PRD Sec 5: Zod validation
    const { email, password, walletAddress } = SignupApiSchema.parse(body);

    // 2. Create Supabase user // Per PRD Sec 3: Supabase Auth
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: signUpError.status || 500 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Signup successful, but no user returned.' }, { status: 404 });
    }

    // 3. Create a Stripe Customer // Per PRD Sec 2.2: Phantom Stripe token
    // This allows attaching payment methods later without re-entering details.
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        user_id: user.id,
      },
    });

    // 4. Insert into `profiles` table // Per TASK COMMAND: Supabase Insert
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        // quota_minutes is 100 by default per table schema
      });

    if (profileError) {
      // TODO: Handle potential rollback of Stripe customer or Supabase user
      console.error('Failed to create user profile:', profileError);
      return NextResponse.json({ error: 'Failed to create user profile.' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Signup successful. Please check your email to verify your account.',
      userId: user.id,
      stripeCustomerId: customer.id,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: error.errors }, { status: 400 });
    }
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
