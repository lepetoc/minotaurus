import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import db from "@/lib/db";
import type { AuthBody, AuthResponse, AuthErrorResponse } from "@/types/auth";

export async function POST(
  req: NextRequest
): Promise<NextResponse<AuthResponse | AuthErrorResponse>> {
  const body: AuthBody | null = await req.json().catch(() => null);
  const { username, password } = body ?? {};

  if (!username || !password) {
    return NextResponse.json(
      { error: "username and password are required" },
      { status: 400 }
    );
  }

  const result = await db.query(
    "SELECT id, username, password_hash FROM users WHERE username = $1",
    [username]
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json(
      { error: "invalid credentials" },
      { status: 401 }
    );
  }

  const token = signToken({ sub: user.id, username: user.username });
  return NextResponse.json({ token });
}
