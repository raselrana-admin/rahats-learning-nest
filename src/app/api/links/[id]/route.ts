import { db, isUuid, LINK_COLUMNS } from "@/lib/db";

export async function PATCH(request: Request, ctx: RouteContext<"/api/links/[id]">) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return Response.json({ error: "Link not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }
  if (typeof body.learned !== "boolean") {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const { data, error } = await db()
    .from("links")
    .update({ learned: body.learned })
    .eq("id", id)
    .select(LINK_COLUMNS)
    .maybeSingle();

  if (error) {
    console.error("Failed to update link", error);
    return Response.json({ error: "Could not update the link. Please try again." }, { status: 500 });
  }
  if (!data) return Response.json({ error: "This link was already removed." }, { status: 404 });
  return Response.json({ link: data });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/links/[id]">) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return Response.json({ error: "Link not found." }, { status: 404 });

  const { error } = await db().from("links").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete link", error);
    return Response.json({ error: "Could not remove the link. Please try again." }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
