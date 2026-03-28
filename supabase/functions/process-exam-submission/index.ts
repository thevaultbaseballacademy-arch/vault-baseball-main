import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation constants
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_QUESTIONS = 200;
const VALID_CERT_TYPES = ['foundations', 'performance', 'catcher_specialist', 'infield_specialist', 'outfield_specialist'];

interface ExamSubmission {
  attemptId: string;
  answers: Record<string, number>;
  questionIds: string[];
  certType: string;
  certificationName: string;
  coachId?: string;
  orgId?: string;
}

function validateExamSubmission(body: unknown): { valid: boolean; error?: string; submission?: ExamSubmission } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be an object" };
  }

  const b = body as Record<string, unknown>;

  // Validate attemptId (UUID)
  if (typeof b.attemptId !== "string" || !UUID_REGEX.test(b.attemptId)) {
    return { valid: false, error: "attemptId must be a valid UUID" };
  }

  // Validate answers (Record<string, number>)
  if (typeof b.answers !== "object" || b.answers === null || Array.isArray(b.answers)) {
    return { valid: false, error: "answers must be an object" };
  }
  const answers: Record<string, number> = {};
  for (const [key, value] of Object.entries(b.answers as Record<string, unknown>)) {
    if (!UUID_REGEX.test(key)) {
      return { valid: false, error: `Answer key "${key}" must be a valid UUID` };
    }
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10) {
      return { valid: false, error: `Answer value for "${key}" must be an integer between 0 and 10` };
    }
    answers[key] = value;
  }

  // Validate questionIds (array of UUIDs)
  if (!Array.isArray(b.questionIds)) {
    return { valid: false, error: "questionIds must be an array" };
  }
  if (b.questionIds.length === 0) {
    return { valid: false, error: "questionIds cannot be empty" };
  }
  if (b.questionIds.length > MAX_QUESTIONS) {
    return { valid: false, error: `Maximum ${MAX_QUESTIONS} questions allowed` };
  }
  for (const qId of b.questionIds) {
    if (typeof qId !== "string" || !UUID_REGEX.test(qId)) {
      return { valid: false, error: "Each questionId must be a valid UUID" };
    }
  }

  // Validate certType
  if (typeof b.certType !== "string" || !VALID_CERT_TYPES.includes(b.certType)) {
    return { valid: false, error: `certType must be one of: ${VALID_CERT_TYPES.join(", ")}` };
  }

  // passingScore and validityMonths are now looked up server-side from certification_definitions
  // Client-supplied values are ignored

  // Validate certificationName
  if (typeof b.certificationName !== "string" || b.certificationName.length === 0 || b.certificationName.length > 200) {
    return { valid: false, error: "certificationName must be a non-empty string (max 200 characters)" };
  }

  // Optional: coachId (UUID)
  if (b.coachId !== undefined && (typeof b.coachId !== "string" || !UUID_REGEX.test(b.coachId))) {
    return { valid: false, error: "coachId must be a valid UUID if provided" };
  }

  // Optional: orgId (UUID)
  if (b.orgId !== undefined && (typeof b.orgId !== "string" || !UUID_REGEX.test(b.orgId))) {
    return { valid: false, error: "orgId must be a valid UUID if provided" };
  }

  return {
    valid: true,
    submission: {
      attemptId: b.attemptId,
      answers,
      questionIds: b.questionIds as string[],
      certType: b.certType,
      certificationName: b.certificationName,
      coachId: b.coachId as string | undefined,
      orgId: b.orgId as string | undefined,
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create client with user's auth
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Processing exam submission for user: ${user.id}`);

    // Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateExamSubmission(rawBody);
    if (!validation.valid) {
      console.error("Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { attemptId, answers, questionIds, certType, certificationName, coachId, orgId } = validation.submission!;

    // Use service role client for grading (access to correct answers)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Look up passingScore and validityMonths from certification_definitions (server-side source of truth)
    const { data: certDef, error: certDefError } = await supabaseAdmin
      .from('certification_definitions')
      .select('passing_score, validity_months')
      .eq('certification_type', certType)
      .single();

    if (certDefError || !certDef) {
      console.error('Error fetching certification definition:', certDefError);
      return new Response(
        JSON.stringify({ error: "Invalid certification type" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const passingScore = certDef.passing_score;
    const validityMonths = certDef.validity_months;

    // Fetch questions with correct answers
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('certification_questions')
      .select('id, correct_answer_index')
      .in('id', questionIds);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      throw new Error('Failed to fetch questions');
    }

    // Grade the exam
    let correct = 0;
    const questionMap = new Map(questions?.map(q => [q.id, q.correct_answer_index]) || []);
    
    for (const questionId of questionIds) {
      const selectedAnswer = answers[questionId];
      const correctAnswer = questionMap.get(questionId);
      if (selectedAnswer !== undefined && selectedAnswer === correctAnswer) {
        correct++;
      }
    }

    const totalQuestions = questionIds.length;
    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= passingScore;
    const completedAt = new Date().toISOString();

    console.log(`Exam graded: ${correct}/${totalQuestions} = ${score}%, passed: ${passed}`);

    // Update certification_attempts table
    const { error: attemptError } = await supabaseAdmin
      .from('certification_attempts')
      .update({
        completed_at: completedAt,
        answers,
        score,
        passed,
      })
      .eq('id', attemptId)
      .eq('user_id', user.id);

    if (attemptError) {
      console.error('Error updating attempt:', attemptError);
      throw new Error('Failed to update attempt');
    }

    let expiresAt: string | undefined;
    let certificateNumber: string | null = null;

    // If passed, create/update user certification
    if (passed) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
      expiresAt = expiryDate.toISOString();

      const { data: certData, error: certError } = await supabaseAdmin
        .from('user_certifications')
        .upsert({
          user_id: user.id,
          certification_type: certType,
          status: 'active',
          issued_at: completedAt,
          expires_at: expiresAt,
          score,
          attempt_id: attemptId,
        }, {
          onConflict: 'user_id,certification_type',
        })
        .select('certificate_number')
        .single();

      if (certError) {
        console.error('Error creating user certification:', certError);
        throw new Error('Failed to create certification');
      }

      certificateNumber = certData?.certificate_number;
      console.log(`User certification created/updated with certificate: ${certificateNumber}`);
    }

    // Map user certification type to admin cert type
    const adminCertTypeMap: Record<string, string> = {
      'foundations': 'Foundations',
      'performance': 'Performance',
      'catcher_specialist': 'Catcher',
      'infield_specialist': 'Infield',
      'outfield_specialist': 'Outfield',
    };
    const adminCertType = adminCertTypeMap[certType] || certType;

    // Check if this user has a coach record
    const { data: coachRecord } = await supabaseAdmin
      .from('coaches')
      .select('id, org_id')
      .eq('user_id', user.id)
      .single();

    // If user is a coach in admin system, also create admin_exam_attempts and update admin_certifications
    if (coachRecord || (coachId && orgId)) {
      const finalCoachId = coachRecord?.id || coachId;
      const finalOrgId = coachRecord?.org_id || orgId;

      // Calculate duration (approximate based on attempt creation)
      const { data: attemptData } = await supabaseAdmin
        .from('certification_attempts')
        .select('started_at')
        .eq('id', attemptId)
        .single();

      const startedAt = attemptData?.started_at ? new Date(attemptData.started_at) : new Date();
      const durationSeconds = Math.round((new Date().getTime() - startedAt.getTime()) / 1000);

      // Create admin exam attempt
      const { error: adminAttemptError } = await supabaseAdmin
        .from('admin_exam_attempts')
        .insert({
          coach_id: finalCoachId,
          org_id: finalOrgId,
          cert_type: adminCertType,
          score,
          pass_fail: passed,
          duration_seconds: durationSeconds,
        });

      if (adminAttemptError) {
        console.error('Error creating admin exam attempt:', adminAttemptError);
        // Non-fatal - continue
      } else {
        console.log(`Admin exam attempt recorded for coach: ${finalCoachId}`);
      }

      // Update or create admin certification
      const today = new Date().toISOString().split('T')[0];
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      const expirationDateStr = expirationDate.toISOString().split('T')[0];

      if (passed) {
        // Upsert certification with active status
        const { error: adminCertError } = await supabaseAdmin
          .from('admin_certifications')
          .upsert({
            coach_id: finalCoachId,
            org_id: finalOrgId,
            cert_type: adminCertType,
            status: 'Active',
            issued_date: today,
            expiration_date: expirationDateStr,
            last_score: score,
          }, {
            onConflict: 'coach_id,cert_type',
            ignoreDuplicates: false,
          });

        if (adminCertError) {
          console.error('Error upserting admin certification:', adminCertError);
          // Non-fatal - continue
        } else {
          console.log(`Admin certification updated for coach: ${finalCoachId}, type: ${adminCertType}`);
        }
      } else {
        // Just update the last score if failed (don't change status)
        const { data: existingCert } = await supabaseAdmin
          .from('admin_certifications')
          .select('id')
          .eq('coach_id', finalCoachId)
          .eq('cert_type', adminCertType)
          .single();

        if (existingCert) {
          await supabaseAdmin
            .from('admin_certifications')
            .update({ last_score: score })
            .eq('id', existingCert.id);
        }
      }
    }

    // Get user profile for email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('user_id', user.id)
      .single();

    const coachName = profile?.display_name || user.email?.split('@')[0] || 'Coach';
    const email = user.email || profile?.email;

    // Send email notification
    if (email) {
      try {
        await supabaseAdmin.functions.invoke('send-certification-email', {
          body: {
            email,
            coachName,
            certificationName,
            passed,
            score,
            passingScore,
            expiresAt,
            certificateNumber,
          },
        });
        console.log('Certification email sent to:', email);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Non-fatal
      }
    }

    return new Response(
      JSON.stringify({ 
        score, 
        passed, 
        correct, 
        total: totalQuestions,
        certificateNumber,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error processing exam:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorMessage === 'Unauthorized' ? 401 : 500,
      }
    );
  }
});
