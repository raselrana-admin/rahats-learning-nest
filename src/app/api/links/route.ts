import { connection } from "next/server";
import { db, LINK_COLUMNS } from "@/lib/db";
import { LIMITS, SUBJECT_IDS, type SubjectId } from "@/lib/subjects";

export async function GET() {
  await connection();
  const { data, error } = await db()
    .from("links")
    .select(LINK_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load links", error);
    return Response.json({ error: "Could not load links." }, { status: 500 });
  }
  return Response.json({ links: data });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const url = normalizeUrl(String(body.url ?? ""));
  const title = String(body.title ?? "").trim();
  const subject = String(body.subject ?? "") as SubjectId;
  const note = String(body.note ?? "").trim();

  if (!url) {
    return Response.json({ error: "Please type a real web link, like khanacademy.org" }, { status: 400 });
  }
  if (!title || title.length > LIMITS.title) {
    return Response.json({ error: `Please give the link a title (up to ${LIMITS.title} letters).` }, { status: 400 });
  }
  if (!SUBJECT_IDS.includes(subject)) {
    return Response.json({ error: "Please pick a subject." }, { status: 400 });
  }
  if (note.length > LIMITS.note) {
    return Response.json({ error: `The note is too long (up to ${LIMITS.note} letters).` }, { status: 400 });
  }

  const { data, error } = await db()
    .from("links")
    .insert({ url, title, subject, note: note || null })
    .select(LINK_COLUMNS)
    .single();

  if (error) {
    console.error("Failed to save link", error);
    return Response.json({ error: "Could not save the link. Please try again." }, { status: 500 });
  }
  return Response.json({ link: data }, { status: 201 });
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > LIMITS.url) return null;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
