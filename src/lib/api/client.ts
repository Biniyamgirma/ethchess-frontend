import axios from "axios";
import { env } from "@/config/env";
import { clearMemberSession } from "@/lib/auth/member-storage";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(input: {
    status: number;
    message: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status;
    this.fieldErrors = input.fieldErrors;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData: unknown = error.response?.data;
      const body =
        typeof responseData === "object" && responseData !== null
          ? responseData
          : null;
      const message =
        body && "message" in body && typeof body.message === "string"
          ? body.message
          : error.message || "Something went wrong.";
      const validationErrors =
        body && "errors" in body && typeof body.errors === "object"
          ? body.errors
          : null;
      const fieldErrors =
        validationErrors &&
        "fieldErrors" in validationErrors &&
        typeof validationErrors.fieldErrors === "object" &&
        validationErrors.fieldErrors !== null
          ? Object.fromEntries(
              Object.entries(validationErrors.fieldErrors).filter(
                (entry): entry is [string, string[]] =>
                  Array.isArray(entry[1]) &&
                  entry[1].every((item) => typeof item === "string"),
              ),
            )
          : undefined;

      if (error.response?.status === 401 && typeof window !== "undefined") {
        if (window.location.pathname.startsWith("/member")) {
          clearMemberSession();
          if (!window.location.pathname.startsWith("/member/login")) {
            window.location.replace("/member/login");
          }
        }
      }

      return Promise.reject(
        new ApiError({
          status: error.response?.status ?? 0,
          message,
          fieldErrors,
        }),
      );
    }
    return Promise.reject(error);
  },
);
