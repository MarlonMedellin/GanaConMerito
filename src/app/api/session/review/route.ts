import { NextResponse } from "next/server";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) return NextResponse.json({error:auth.error},{status:auth.status});
  const value = new URL(request.url).searchParams.get("attemptId");
  if (value && !z.string().uuid().safeParse(value).success) return NextResponse.json({error:"Invalid attempt"},{status:400});
  let query = getSupabaseAdminClient().from("practice_attempts").select("id,session_id,question_id,result").eq("profile_id",auth.profile.id).eq("phase","submitted").order("submitted_at",{ascending:false}).limit(1);
  if (value) query=query.eq("id",value);
  const {data,error}=await query.maybeSingle();
  if (error) return NextResponse.json({error:"Review unavailable"},{status:500});
  if (!data) return NextResponse.json({error:"No hay respuestas guardadas para revisar."},{status:404});
  return NextResponse.json({attemptId:data.id,sessionId:data.session_id,itemId:data.question_id,result:data.result});
}
