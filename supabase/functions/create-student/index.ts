import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
    },
  });
}

/**
 * Generate an unbiased random index using cryptographically
 * secure random bytes.
 */
function randomIndex(max: number): number {
  if (!Number.isInteger(max) || max < 1 || max > 256) {
    throw new Error("Invalid random index range.");
  }

  const limit = Math.floor(256 / max) * max;
  const bytes = new Uint8Array(1);

  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);

  return bytes[0] % max;
}

function randomString(length: number, characters: string): string {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters[randomIndex(characters.length)];
  }

  return result;
}

/**
 * Format: ALS + two-digit year + seven random characters.
 * Total length: 12 characters.
 */
function makeStudentId(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return `ALS${year}${randomString(7, characters)}`;
}

/**
 * Generate a 10-character temporary password.
 * Guarantees uppercase, lowercase, numeric, and special characters.
 */
function makeTemporaryPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%";

  const all = upper + lower + digits + special;

  const characters = [
    upper[randomIndex(upper.length)],
    lower[randomIndex(lower.length)],
    digits[randomIndex(digits.length)],
    special[randomIndex(special.length)],
    ...randomString(6, all),
  ];

  // Shuffle the characters so the required character types
  // do not always appear in predictable positions.
  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);

    [characters[i], characters[j]] = [
      characters[j],
      characters[i],
    ];
  }

  return characters.join("");
}

Deno.serve(async (req: Request) => {
  // Handle browser CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(
      { success: false, error: "Method not allowed." },
      405,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !serviceKey || !anonKey) {
    console.error("Required Supabase configuration is missing.");

    return json(
      {
        success: false,
        error:
          "Server configuration is incomplete. Check the Supabase function secrets.",
      },
      500,
    );
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return json(
      {
        success: false,
        error: "Sign in as a Rector before creating students.",
      },
      401,
    );
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let authUserId: string | null = null;
  let studentRecordId: string | null = null;
  let profileInserted = false;

  try {
    // Verify the current user's identity.
    const { data: authData, error: authError } =
      await userClient.auth.getUser();

    if (authError || !authData.user) {
      return json(
        {
          success: false,
          error: "Your session is invalid. Please sign in again.",
        },
        401,
      );
    }

    const rector = authData.user;

    // Only authenticated Rectors can create student accounts.
    if (rector.app_metadata?.role !== "rector") {
      return json(
        {
          success: false,
          error:
            "Only an authenticated Rector can create student accounts.",
        },
        403,
      );
    }

    // Read and validate the registration form.
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const year = String(body.year ?? "").trim();
    const department = String(body.department ?? "").trim();
    const roomNumber = String(body.roomNumber ?? "").trim();

    if (
      !name ||
      !email ||
      !phone ||
      !year ||
      !department ||
      !roomNumber
    ) {
      return json(
        {
          success: false,
          error: "Complete all six required student fields.",
        },
        400,
      );
    }

    if (
      name.length > 120 ||
      email.length > 254 ||
      phone.length > 20 ||
      year.length > 50 ||
      department.length > 100 ||
      roomNumber.length > 30
    ) {
      return json(
        {
          success: false,
          error: "One or more fields exceed the allowed length.",
        },
        400,
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(
        {
          success: false,
          error: "Enter a valid student email address.",
        },
        400,
      );
    }

    // Prevent duplicate student records.
    const { data: existingStudent, error: existingError } =
      await admin
        .from("students")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (existingError) {
      throw new Error(
        `Could not check existing students: ${existingError.message}`,
      );
    }

    if (existingStudent) {
      return json(
        {
          success: false,
          error:
            "A student record already exists for this email address.",
        },
        409,
      );
    }

    // Generate a unique Student ID.
    let studentId = "";
    let unique = false;

    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = makeStudentId();

      const { data: found, error: findError } = await admin
        .from("students")
        .select("id")
        .eq("roll_number", candidate)
        .maybeSingle();

      if (findError) {
        throw new Error(
          `Could not verify Student ID uniqueness: ${findError.message}`,
        );
      }

      if (!found) {
        studentId = candidate;
        unique = true;
        break;
      }
    }

    if (!unique) {
      throw new Error(
        "Could not generate a unique Student ID. Please try again.",
      );
    }

    // Generate the temporary password.
    const temporaryPassword = makeTemporaryPassword();

    // Create the student's Supabase Auth account.
    // No email is sent by this function.
    const { data: createdAuth, error: createAuthError } =
      await admin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        app_metadata: {
          role: "student",
        },
        user_metadata: {
          full_name: name,
          student_id: studentId,
          must_change_password: true,
        },
      });

    if (createAuthError || !createdAuth.user) {
      const message =
        createAuthError?.message ??
        "Unable to create the authentication account.";

      if (
        /already registered|already been registered|already exists/i.test(
          message,
        )
      ) {
        return json(
          {
            success: false,
            error:
              "This email already has a Supabase Auth account. Use a different email or resolve the existing account first.",
          },
          409,
        );
      }

      throw new Error(message);
    }

    authUserId = createdAuth.user.id;

    // Insert the student profile.
    const { error: profileError } = await admin
      .from("profiles")
      .insert({
        id: authUserId,
        full_name: name,
        role: "student",
        email,
        phone,
      });

    if (profileError) {
      throw new Error(
        `Could not create student profile: ${profileError.message}`,
      );
    }

    profileInserted = true;

    // Insert the student record using the existing schema.
    const { data: student, error: studentError } = await admin
      .from("students")
      .insert({
        auth_user_id: authUserId,
        created_by: rector.id,
        roll_number: studentId,
        full_name: name,
        email,
        phone,
        academic_year: year,
        department,
        room_number: roomNumber,
        account_status: "active",
      })
      .select(
        "id, auth_user_id, roll_number, full_name, email, phone, academic_year, department, room_number, bed, gender, parent_name, parent_phone, avatar_path",
      )
      .single();

    if (studentError || !student) {
      throw new Error(
        studentError?.message ??
          "The student record was not returned.",
      );
    }

    studentRecordId = student.id;

    // Return the credentials to the authenticated Rector's interface.
    // Resend is intentionally not used.
    return json({
      success: true,
      message:
        "Student account created successfully. Share these credentials with the student.",
      student: {
        ...student,
        studentId,
        temporaryPassword,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    // Roll back only records created by this invocation.
    // Never delete an existing student or profile.
    const cleanupErrors: string[] = [];

    if (studentRecordId) {
      const { error: cleanupError } = await admin
        .from("students")
        .delete()
        .eq("id", studentRecordId);

      if (cleanupError) {
        cleanupErrors.push(
          `Student cleanup failed: ${cleanupError.message}`,
        );
      }
    }

    if (profileInserted && authUserId) {
      const { error: cleanupError } = await admin
        .from("profiles")
        .delete()
        .eq("id", authUserId);

      if (cleanupError) {
        cleanupErrors.push(
          `Profile cleanup failed: ${cleanupError.message}`,
        );
      }
    }

    if (authUserId) {
      const { error: cleanupError } =
        await admin.auth.admin.deleteUser(authUserId);

      if (cleanupError) {
        cleanupErrors.push(
          `Auth cleanup failed: ${cleanupError.message}`,
        );
      }
    }

    console.error("create-student failed:", error);

    if (cleanupErrors.length > 0) {
      console.error("Registration cleanup warnings:", cleanupErrors);
    }

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Student registration failed.",
      },
      500,
    );
  }
});