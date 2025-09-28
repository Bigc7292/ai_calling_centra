"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Supabase URL being used:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleSignIn = async (email: string, password: string) => {
    console.log("Attempting to sign in with:", { email, supabaseUrl });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign in error:", error);
      alert(`Sign in error: ${error.message}`);
    } else {
      console.log("Sign in successful:", data);
      router.push("/");
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    console.log("Attempting to sign up with:", { email, supabaseUrl });
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: 'http://localhost:3000'
      }
    });
    if (error) {
      console.error("Sign up error:", error);
      alert(`Sign up error: ${error.message}`);
    } else {
      console.log("Sign up successful:", data);
      if (data.user?.identities?.length === 0) {
        alert("This email is already registered. Please sign in instead.");
      } else {
        alert("Account created successfully! You can now sign in.");
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
    } else {
      setSession(null);
      router.push("/login");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", padding: 16 }} className="card">
        <h1 style={{ marginTop: 0 }}>Sign In / Sign Up</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem("email") as HTMLInputElement).value;
            const password = (form.elements.namedItem("password") as HTMLInputElement).value;
            await handleSignIn(email, password);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <input type="email" name="email" placeholder="Email" required style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          <input type="password" name="password" placeholder="Password" required style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          <button type="submit" className="btn">Sign In</button>
          <button
            type="button"
            className="btn-outline"
            onClick={async () => {
              const form = document.querySelector("form") as HTMLFormElement;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const password = (form.elements.namedItem("password") as HTMLInputElement).value;
              await handleSignUp(email, password);
            }}
          >
            Sign Up
          </button>
        </form>
        <div style={{ marginTop: 20, fontSize: '0.8em', color: '#666' }}>
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthGate");
  }
  return context;
};