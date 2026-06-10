import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

export function signToken(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken<T>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}
