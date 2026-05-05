import { apiKeyClient, adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const baseURL =
  process.env.NODE_ENV === "production"
    ? undefined
    : "http://localhost:3001"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: baseURL,
     plugins: [ 
        apiKeyClient(),
        adminClient()
    ] 
})