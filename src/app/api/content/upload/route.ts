import { NextResponse } from "next/server";
import { parseMarkdownItem } from "../../../../domain/content/parse-md";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";
import { rawMarkdownSchema } from "../../../../lib/validation/content";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, errors: ["Unauthorized"] }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ ok: false, errors: ["Profile not found"] }, { status: 404 });
  }

  if (!profile.is_admin) {
    return NextResponse.json({ ok: false, errors: ["Forbidden"] }, { status: 403 });
  }

  const json = await request.json();
  const parsedBody = rawMarkdownSchema.safeParse(json);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        ok: false,
        itemId: undefined,
        version: undefined,
        errors: parsedBody.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }

  const result = parseMarkdownItem(parsedBody.data.rawMarkdown);

  if (!result.ok || !result.item) {
    return NextResponse.json(
      {
        ok: false,
        itemId: undefined,
        version: undefined,
        errors: result.errors,
      },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminClient();
  const item = result.item;

  const { data, error } = await admin.rpc("upsert_content_item", {
    p_content_id: item.id,
    p_slug: item.slug,
    p_title: item.title,
    p_area: item.area,
    p_subarea: item.subarea ?? null,
    p_exam_type: item.examType,
    p_competency: item.competency,
    p_difficulty: item.difficulty,
    p_target_level: item.targetLevel ?? null,
    p_item_type: item.itemType,
    p_stem: item.stem,
    p_correct_option: item.correctOption,
    p_explanation: item.explanation,
    p_normative_refs: item.normativeRefs,
    p_is_published: item.published,
    p_version: item.version,
    p_options: item.options,
    p_source_path: null,
  });

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        errors: [error?.message ?? "No se pudo persistir el contenido de forma atómica."],
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      itemId: data[0].item_id,
      version: data[0].item_version,
      errors: [],
    },
    { status: 200 },
  );
}
