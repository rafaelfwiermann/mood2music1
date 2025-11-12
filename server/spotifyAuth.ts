import { Request, Response } from "express";
import { exchangeCodeForToken, getSpotifyUser } from "./spotify";
import { upsertSpotifyToken } from "./db";
import { sdk } from "./_core/sdk";

/**
 * Handle Spotify OAuth callback
 * This endpoint is called after user authorizes the app on Spotify
 */
export async function handleSpotifyCallback(req: Request, res: Response) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?error=spotify_auth_failed&message=${error}`);
  }

  if (!code || typeof code !== "string") {
    return res.redirect("/?error=missing_code");
  }

  try {
    // Get current logged in user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.redirect("/?error=not_logged_in");
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForToken(code);

    // Get Spotify user info
    const spotifyUser = await getSpotifyUser(tokenResponse.access_token);

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    // Store tokens in database
    await upsertSpotifyToken({
      userId: user.id,
      spotifyId: spotifyUser.id,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || null,
      expiresAt,
    });

    // Redirect to onboarding or dashboard
    return res.redirect("/onboarding");
  } catch (err) {
    console.error("Spotify OAuth error:", err);
    return res.redirect("/?error=spotify_auth_failed");
  }
}
