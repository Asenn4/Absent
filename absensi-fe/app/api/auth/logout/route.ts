import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  response.cookies.set("auth_role", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: false,
  });
  
  response.cookies.set("user_id", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: false,
  });

  return response;
}
