const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://job-portal-system-6yb1.onrender.com/api";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers: customHeaders, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(customHeaders as Record<string, string>),
  };

  if (requiresAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  let res = await fetch(url, {
    ...rest,
    headers,
  });

  // Handle 401 Unauthorized with token refresh if in browser
  if (res.status === 401 && requiresAuth && typeof window !== "undefined" && !path.includes("/auth/")) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const session = await refreshRes.json();
          if (session.accessToken) {
            localStorage.setItem("accessToken", session.accessToken);
            if (session.refreshToken) localStorage.setItem("refreshToken", session.refreshToken);
            if (session.user) localStorage.setItem("user", JSON.stringify(session.user));

            // Retry original request with new token
            headers["Authorization"] = `Bearer ${session.accessToken}`;
            res = await fetch(url, {
              ...rest,
              headers,
            });
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      } catch {
        // Refresh failed
      }
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? "Something went wrong. Please try again.");
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiUpload<T>(path: string, body: FormData): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}
