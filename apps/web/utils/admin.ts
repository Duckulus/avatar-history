import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { Role } from "@avatar-history/db";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export const isAdminRole = (role?: Role) =>
  role == "admin" || role == "superadmin";

/**
 * Resolves the caller's Discord id if they have one of the given roles,
 * otherwise sends 401/403 and returns null. The role is re-evaluated on every
 * request, so revoking admin rights takes effect immediately.
 */
export const requireRole = async (
  req: NextApiRequest,
  res: NextApiResponse,
  roles: Role[]
): Promise<string | null> => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.discordId) {
    res.status(401).json({ error: "Not signed in" });
    return null;
  }
  if (!session.role || !roles.includes(session.role)) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return session.discordId;
};

export const isSnowflake = (value: unknown): value is string =>
  typeof value == "string" && /^\d{15,21}$/.test(value);
