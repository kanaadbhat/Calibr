import { NextResponse } from "next/server";
import EmployerProfile from "@/models/employerProfile.model";
import { withDatabase, createErrorResponse, logAction, logError } from "@/utils/action-helpers";
import { validateSession } from "@/utils/auth-helpers";

export async function GET() {
  try {
    logAction("📡", "Employer profile API called");

    const { success, candidateId: userId, error } = await validateSession();

    if (!success || !userId) {
      logError("Unauthorized access attempt");
      return NextResponse.json(
        createErrorResponse("Unauthorized", error),
        { status: 401 }
      );
    }

    const result = await withDatabase(async () => {
      logAction("🔍", "Fetching profile for employer:", userId);

      const profile = await EmployerProfile
        .findOne({ employer: userId })
        .select("profileImage")
        .lean();

      logAction("📦", "Profile found:", profile ? "Yes" : "No");
      logAction("🖼️", "Profile image:", profile?.profileImage || "None");

      return {
        success: true,
        data: {
          profileImage: profile?.profileImage || null,
        },
      };
    }, "Error fetching employer profile");

    return NextResponse.json(result);
  } catch (error) {
    logError("Error fetching employer profile image", error);
    return NextResponse.json(
      createErrorResponse("Internal server error", error),
      { status: 500 }
    );
  }
}
