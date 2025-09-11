import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { loadEnv } from "@eva/config";
import { createClient } from "@supabase/supabase-js";

const env = loadEnv();
const JWKS = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/keys`));
const supaServiceRole = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
      tenantId?: string;
      role?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["RS256"],
    });

    const userId = payload.sub as string;
    const userEmail = payload.email as string;

    // Attach user to request
    req.user = { id: userId, email: userEmail };

    // Resolve tenantId and role
    const { data: profile, error: profileError } = await supaServiceRole
      .from("profiles")
      .select("default_tenant_id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found or error fetching profile:", profileError);
      return res.status(403).json({ error: "User profile not found or no default tenant assigned." });
    }

    req.tenantId = profile.default_tenant_id;

    const { data: member, error: memberError } = await supaServiceRole
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", req.tenantId)
      .eq("user_id", userId)
      .single();

    if (memberError || !member) {
      console.error("Tenant member not found or error fetching tenant member:", memberError);
      return res.status(403).json({ error: "User is not a member of the default tenant." });
    }

    req.role = member.role;
    next();
  } catch (e: any) {
    console.error("Authentication error:", e);
    res.status(401).json({ error: e.message || "Unauthorized" });
  }
};

export const requireRole = (minRole: 'AGENT' | 'ADMIN' | 'OWNER') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(403).json({ error: "Forbidden: Role not assigned." });
    }

    const roles = ['AGENT', 'MEMBER', 'ADMIN', 'OWNER']; // Define a hierarchy if needed, for now just exact match
    const userRoleIndex = roles.indexOf(req.role);
    const minRoleIndex = roles.indexOf(minRole);

    if (userRoleIndex >= minRoleIndex) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Insufficient role." });
    }
  };
};
