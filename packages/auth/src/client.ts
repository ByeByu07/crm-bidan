import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

function getBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [organizationClient()],
});
