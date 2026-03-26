export class ApiClientError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const REQUEST_TIMEOUT_MS = 65_000;

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit & { json?: JsonValue | Record<string, unknown> },
  retries = 2,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(input, {
        ...init,
        headers,
        body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiClientError(
          "The request took too long. Please try again with a shorter prompt or try again in a moment.",
          408,
        );
      }

      throw error;
    }

    clearTimeout(timeoutId);

    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : null;

    if (response.ok) {
      return data as T;
    }

    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
    const message =
      data?.error ||
      data?.message ||
      "Something went wrong while talking to the server.";

    if (attempt < retries && response.status >= 500) {
      const delaySeconds = retryAfter && Number.isFinite(retryAfter) ? retryAfter : 2 ** attempt;
      await wait(delaySeconds * 1000);
      attempt += 1;
      continue;
    }

    throw new ApiClientError(message, response.status, retryAfter);
  }
}
