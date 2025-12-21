import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from the request
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 })
    }

    // Call backend API to reset users with ADMIN_SECRET from server env
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reset-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Admin-Secret": process.env.ADMIN_SECRET || "",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Backend error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin] Reset users error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset database" },
      { status: 500 },
    )
  }
}
