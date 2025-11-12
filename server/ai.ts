import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { MusicParameters } from "./spotify";

export interface VibeAnalysis {
  parameters: MusicParameters;
  playlistTitle: string;
  playlistDescription: string;
  moodType: string;
}

/**
 * Map user's vibe description to musical parameters using AI
 */
export async function analyzeVibe(vibeDescription: string): Promise<VibeAnalysis> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a music expert that maps emotions and scenarios to musical parameters.
Given a user's description of their mood or setting, extract the following parameters:
- energy: 0-1 (how energetic the music should be)
- valence: 0-1 (how positive/happy the music should feel, 0=sad, 1=happy)
- tempo: BPM (beats per minute, typical range 60-180)
- genres: array of 1-3 Spotify genre seeds
- acousticness: 0-1 (0=electronic, 1=acoustic)
- danceability: 0-1 (how suitable for dancing)

Also generate:
- A creative playlist title (max 50 chars)
- A poetic playlist description (max 200 chars)
- A mood type category (e.g., "relaxed", "energetic", "romantic", "focused")

Return ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Analyze this vibe: "${vibeDescription}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "vibe_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            energy: { type: "number", description: "Energy level 0-1" },
            valence: { type: "number", description: "Happiness level 0-1" },
            tempo: { type: "number", description: "BPM" },
            genres: {
              type: "array",
              items: { type: "string" },
              description: "Array of genre seeds",
            },
            acousticness: { type: "number", description: "Acoustic vs electronic 0-1" },
            danceability: { type: "number", description: "Danceability 0-1" },
            playlistTitle: { type: "string", description: "Creative playlist title" },
            playlistDescription: { type: "string", description: "Poetic description" },
            moodType: { type: "string", description: "Mood category" },
          },
          required: [
            "energy",
            "valence",
            "tempo",
            "genres",
            "acousticness",
            "danceability",
            "playlistTitle",
            "playlistDescription",
            "moodType",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content);

  return {
    parameters: {
      energy: parsed.energy,
      valence: parsed.valence,
      tempo: parsed.tempo,
      genres: parsed.genres,
      acousticness: parsed.acousticness,
      danceability: parsed.danceability,
    },
    playlistTitle: parsed.playlistTitle,
    playlistDescription: parsed.playlistDescription,
    moodType: parsed.moodType,
  };
}

/**
 * Generate playlist cover image based on vibe
 */
export async function generatePlaylistCover(vibeDescription: string, moodType: string): Promise<string | undefined> {
  const prompt = `Abstract artistic visualization of the mood: ${vibeDescription}. 
Style: Modern, vibrant, album cover art. 
Mood: ${moodType}. 
No text, no people, focus on colors and atmosphere.`;

  const result = await generateImage({ prompt });
  return result.url || undefined;
}

/**
 * Analyze user's Spotify history to enhance recommendations
 */
export async function analyzeUserHistory(
  topTracks: Array<{ name: string; artists: string[] }>,
  topArtists: Array<{ name: string; genres: string[] }>
): Promise<{ genres: string[]; insights: string }> {
  const tracksInfo = topTracks.map(t => `${t.name} by ${t.artists.join(", ")}`).join("; ");
  const artistsInfo = topArtists.map(a => `${a.name} (${a.genres.join(", ")})`).join("; ");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a music analyst. Given a user's top tracks and artists, identify:
1. Their preferred genres (return 3-5 genre seeds compatible with Spotify)
2. A brief insight about their music taste (1 sentence)

Return ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Top tracks: ${tracksInfo}\nTop artists: ${artistsInfo}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "history_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            genres: {
              type: "array",
              items: { type: "string" },
              description: "Preferred genre seeds",
            },
            insights: { type: "string", description: "Brief music taste insight" },
          },
          required: ["genres", "insights"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content);
  return {
    genres: parsed.genres,
    insights: parsed.insights,
  };
}
