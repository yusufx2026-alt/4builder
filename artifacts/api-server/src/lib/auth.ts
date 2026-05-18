import jwt from "jsonwebtoken";

const secret = process.env.SESSION_SECRET ?? "dev-secret-change-in-prod";

export interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
