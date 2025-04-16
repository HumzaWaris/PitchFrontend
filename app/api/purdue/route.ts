import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";   // never cache – we always want fresh results

/**  Format directory name → “John Doe”
 *   • keeps only first + last token (drops middles)
 *   • capitalises first letter of each
 */
function formatName(raw: string): string {
  const parts = raw.trim().split(/\s+/);

  if (parts.length === 1 && raw.includes(",")) {
    const [last, first] = raw.split(",").map(s => s.trim());
    return `${capitalize(first)} ${capitalize(last)}`;
  }

  const first = parts[0] ?? "";
  const last  = parts.length > 1 ? parts[parts.length - 1] : "";

  return `${capitalize(first)}${last ? " " + capitalize(last) : ""}`;
}

function capitalize(word: string) {
  return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const alias = email.split("@")[0];          // everything before “@”

  if (!alias) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const directoryURL =
    `https://www.purdue.edu/directory/Advanced?` +
    `searchString=${encodeURIComponent(alias)}` +
    `&campusParam=All%20Campuses&schoolParam=All%20Schools` +
    `&departParam=All%20Departments&usingParam=Search%20by%20Alias&selectedSearchTypeId=0`;

  try {
    const res = await fetch(directoryURL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ found: false }, { status: res.status });
    }

    const html = await res.text();
    const match = html.match(/<h2 class="cn-name">([^<]+)<\/h2>/i);

    if (match) {
      const rawName = match[1];
      const name    = formatName(rawName);
      return NextResponse.json({ found: true, name });
    }

    return NextResponse.json({ found: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ found: false }, { status: 500 });
  }
}
