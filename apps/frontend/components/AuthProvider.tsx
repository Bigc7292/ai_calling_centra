"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import styles from "./AuthProvider.module.css";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Better to warn loudly in dev so it's obvious when env is misconfigured
  console.log(
    "Missing Supabase environment variables. Bypassing authentication for demo purposes."
  );
} else {
  console.log("Supabase URL being used:", supabaseUrl);
}

// Create a mock supabase client for demo purposes
const createMockClient = () => {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'demo-user', email: 'demo@example.com' } } }, error: null }),
      onAuthStateChange: (callback: any) => {
        callback('SIGNED_IN', { user: { id: 'demo-user', email: 'demo@example.com' } });
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: () => Promise.resolve({ data: { user: { id: 'demo-user', email: 'demo@example.com' } }, error: null }),
      signUp: () => Promise.resolve({ data: { user: { id: 'demo-user', email: 'demo@example.com' } }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
};

export const supabase = supabaseUrl && supabaseAnonKey ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  createMockClient();

interface AuthContextType {
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  // For demo purposes, bypass authentication
  const [session, setSession] = useState<any>({ user: { id: 'demo-user', email: 'demo@example.com' } });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  /*
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  */

  const handleSignIn = async (email: string, password: string) => {
    console.log("Demo mode: bypassing actual sign in");
    setSession({ user: { id: 'demo-user', email: email || 'demo@example.com' } });
    router.push("/");
  };

  const handleSignUp = async (email: string, password: string) => {
    console.log("Demo mode: bypassing actual sign up");
    setSession({ user: { id: 'demo-user', email: email || 'demo@example.com' } });
    router.push("/");
  };

  const signOut = async () => {
    console.log("Demo mode: bypassing actual sign out");
    setSession(null);
    router.push("/login");
  };

  // For demo purposes, bypass loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // For demo purposes, always show children (bypass authentication)
  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );

  /*
  if (!session) {
    return (
      <div className={styles.card + " card"}>
        <h1 className={styles.title}>Sign In / Sign Up</h1>
        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem("email") as HTMLInputElement).value;
            const password = (form.elements.namedItem("password") as HTMLInputElement).value;
            await handleSignIn(email, password);
          }}
          className={styles.form}
        >
          <input type="email" name="email" placeholder="Email" required className={styles.input} />
          <input type="password" name="password" placeholder="Password" required className={styles.input} />
          <button type="submit" className="btn">Sign In</button>
          <button
            type="button"
            className="btn-outline"
            onClick={async () => {
              const form = formRef.current;
              if (!form) return alert('Form not found');
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const password = (form.elements.namedItem("password") as HTMLInputElement).value;
              await handleSignUp(email, password);
            }}
          >
            Sign Up
          </button>
        </form>
  <div className={styles.help}>
          <p>Having trouble signing in?</p>
          <p>1. Check that email confirmation is disabled in Supabase Auth settings</p>
          <p>2. Make sure you're using the correct email and password</p>
          <p>3. Clear your browser cache and try again</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
  */
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthGate");
  }
  return context;
};

export default useAuth;