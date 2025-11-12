import { ENV } from "./_core/env";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: { name: string; images: Array<{ url: string }> };
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls: { spotify: string };
  images: Array<{ url: string }>;
}

export interface MusicParameters {
  energy: number; // 0-1
  valence: number; // 0-1 (happiness)
  tempo: number; // BPM
  genres: string[];
  acousticness?: number; // 0-1
  danceability?: number; // 0-1
  instrumentalness?: number; // 0-1
}

/**
 * Get Spotify OAuth authorization URL
 */
export function getSpotifyAuthUrl(state: string): string {
  const scopes = [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-top-read",
    "user-read-email",
    "user-read-private",
  ];

  const params = new URLSearchParams({
    client_id: ENV.spotifyClientId,
    response_type: "code",
    redirect_uri: ENV.spotifyRedirectUri,
    scope: scopes.join(" "),
    state,
  });

  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${ENV.spotifyClientId}:${ENV.spotifyClientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: ENV.spotifyRedirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${ENV.spotifyClientId}:${ENV.spotifyClientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

/**
 * Get current user's Spotify profile
 */
export async function getSpotifyUser(accessToken: string): Promise<SpotifyUser> {
  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify user");
  }

  return response.json();
}

/**
 * Get user's top tracks
 */
export async function getUserTopTracks(
  accessToken: string,
  limit: number = 5
): Promise<SpotifyTrack[]> {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/top/tracks?limit=${limit}&time_range=medium_term`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get top tracks");
  }

  const data = await response.json();
  return data.items;
}

/**
 * Get user's top artists
 */
export async function getUserTopArtists(
  accessToken: string,
  limit: number = 5
): Promise<Array<{ id: string; name: string; genres: string[] }>> {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/top/artists?limit=${limit}&time_range=medium_term`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get top artists");
  }

  const data = await response.json();
  return data.items;
}

/**
 * Get recommendations based on parameters
 */
export async function getRecommendations(
  accessToken: string,
  params: {
    seedTracks?: string[];
    seedArtists?: string[];
    seedGenres?: string[];
    targetEnergy?: number;
    targetValence?: number;
    targetTempo?: number;
    targetAcousticness?: number;
    targetDanceability?: number;
    limit?: number;
  }
): Promise<SpotifyTrack[]> {
  const queryParams = new URLSearchParams();

  // Spotify requires at least one seed (track, artist, or genre)
  const hasSeedTracks = params.seedTracks && params.seedTracks.length > 0;
  const hasSeedArtists = params.seedArtists && params.seedArtists.length > 0;
  const hasSeedGenres = params.seedGenres && params.seedGenres.length > 0;

  if (!hasSeedTracks && !hasSeedArtists && !hasSeedGenres) {
    // Default to popular genres if no seeds provided
    params.seedGenres = ["pop", "rock"];
  }

  if (params.seedTracks?.length) {
    queryParams.append("seed_tracks", params.seedTracks.slice(0, 5).join(","));
  }
  if (params.seedArtists?.length) {
    queryParams.append("seed_artists", params.seedArtists.slice(0, 5).join(","));
  }
  if (params.seedGenres?.length) {
    queryParams.append("seed_genres", params.seedGenres.slice(0, 5).join(","));
  }
  if (params.targetEnergy !== undefined) {
    queryParams.append("target_energy", params.targetEnergy.toString());
  }
  if (params.targetValence !== undefined) {
    queryParams.append("target_valence", params.targetValence.toString());
  }
  if (params.targetTempo !== undefined) {
    queryParams.append("target_tempo", params.targetTempo.toString());
  }
  if (params.targetAcousticness !== undefined) {
    queryParams.append("target_acousticness", params.targetAcousticness.toString());
  }
  if (params.targetDanceability !== undefined) {
    queryParams.append("target_danceability", params.targetDanceability.toString());
  }
  queryParams.append("limit", (params.limit || 20).toString());

  const response = await fetch(`${SPOTIFY_API_BASE}/recommendations?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get recommendations: ${error}`);
  }

  const data = await response.json();
  return data.tracks;
}

/**
 * Create a new playlist in user's account
 */
export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string,
  isPublic: boolean = false
): Promise<SpotifyPlaylist> {
  const response = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: isPublic,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create playlist: ${error}`);
  }

  return response.json();
}

/**
 * Add tracks to a playlist
 */
export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: trackUris,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add tracks to playlist: ${error}`);
  }
}

/**
 * Upload custom image to playlist
 */
export async function uploadPlaylistCover(
  accessToken: string,
  playlistId: string,
  imageBase64: string
): Promise<void> {
  // Remove data:image/jpeg;base64, prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/images`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "image/jpeg",
    },
    body: base64Data,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload playlist cover: ${error}`);
  }
}

/**
 * Get available genre seeds for recommendations
 */
export async function getAvailableGenreSeeds(accessToken: string): Promise<string[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/recommendations/available-genre-seeds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get available genres");
  }

  const data = await response.json();
  return data.genres;
}
