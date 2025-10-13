import { NextResponse } from "next/server";
import candidateProfile from "@/models/candidateProfile.model";
import { withDatabase, createErrorResponse, logAction, logError } from "@/utils/action-helpers";
import { validateSession } from "@/utils/auth-helpers";

export async function GET() {
  try {
    logAction("📡", "Candidate profile API called");

    const { success, candidateId, error } = await validateSession();

    if (!success || !candidateId) {
      logError("Unauthorized access attempt");
      return NextResponse.json(
        createErrorResponse("Unauthorized", error),
        { status: 401 }
      );
    }

    const result = await withDatabase(async () => {
      logAction("🔍", "Fetching profile for candidate:", candidateId);

      const profile = await candidateProfile
        .findOne({ candidate: candidateId })
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
    }, "Error fetching candidate profile");

    return NextResponse.json(result);
  } catch (error) {
    logError("Error fetching candidate profile image", error);
    return NextResponse.json(
      createErrorResponse("Internal server error", error),
      { status: 500 }
    );
  }
}
