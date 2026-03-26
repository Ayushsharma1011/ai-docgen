import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incoming = await req.formData();
    const file = incoming.get("file");
    const targetType = incoming.get("target_type");

    if (!(file instanceof File) || typeof targetType !== "string") {
      return NextResponse.json({ error: "File and target_type are required." }, { status: 400 });
    }

    const pythonUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("target_type", targetType);

    const healthResponse = await fetch(`${pythonUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    }).catch(() => null);

    if (!healthResponse?.ok) {
      return NextResponse.json(
        {
          error:
            "Converter service is not responding. Start the Python service with `npm run dev:python` and try again.",
        },
        { status: 503 },
      );
    }

    let response: Response;

    try {
      response = await fetch(`${pythonUrl}/convert`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        return NextResponse.json(
          {
            error:
              "Conversion is taking too long. Try a smaller file or restart the Python converter service.",
          },
          { status: 504 },
        );
      }

      throw error;
    }

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Converter service error: ${text}` }, { status: 500 });
    }

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    const disposition = response.headers.get("Content-Disposition");
    if (disposition) {
      headers.set("Content-Disposition", disposition);
    }

    return new NextResponse(buffer, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Conversion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
