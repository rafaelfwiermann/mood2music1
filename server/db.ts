import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  spotifyTokens, InsertSpotifyToken,
  playlists, InsertPlaylist,
  subscriptions, InsertSubscription,
  moodTemplates, InsertMoodTemplate,
  feedback, InsertFeedback
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Spotify token management
export async function getSpotifyToken(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(spotifyTokens).where(eq(spotifyTokens.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSpotifyToken(token: InsertSpotifyToken) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(spotifyTokens).values(token).onDuplicateKeyUpdate({
    set: {
      spotifyId: token.spotifyId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt: token.expiresAt,
      updatedAt: new Date(),
    },
  });
}

export async function deleteSpotifyToken(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(spotifyTokens).where(eq(spotifyTokens.userId, userId));
}

// Playlist management
export async function createPlaylistRecord(playlist: InsertPlaylist) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(playlists).values(playlist);
}

export async function getUserPlaylists(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(playlists).where(eq(playlists.userId, userId)).orderBy(playlists.createdAt);
}

export async function getPlaylistById(playlistId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(playlists).where(eq(playlists.id, playlistId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublicPlaylists(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(playlists).where(eq(playlists.isPublic, 1)).orderBy(playlists.createdAt).limit(limit);
}

export async function incrementPlaylistPlayCount(playlistId: number) {
  const db = await getDb();
  if (!db) return;
  
  const current = await getPlaylistById(playlistId);
  if (!current) return;
  
  await db.update(playlists).set({ playCount: current.playCount + 1 }).where(eq(playlists.id, playlistId));
}

// Subscription management
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  
  if (result.length > 0) {
    return result[0];
  }
  
  // Create default free subscription for new users
  const defaultSubscription: InsertSubscription = {
    userId,
    planType: 'free',
    status: 'active',
    startDate: new Date(),
    endDate: null,
    paymentMethod: null,
    amount: null,
  };
  
  await db.insert(subscriptions).values(defaultSubscription);
  
  const newResult = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return newResult.length > 0 ? newResult[0] : undefined;
}

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(subscriptions).values(subscription).onDuplicateKeyUpdate({
    set: {
      planType: subscription.planType,
      status: subscription.status,
      endDate: subscription.endDate,
      paymentMethod: subscription.paymentMethod,
      amount: subscription.amount,
      updatedAt: new Date(),
    },
  });
}

export async function getMonthlyPlaylistCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const result = await db.select().from(playlists).where(eq(playlists.userId, userId));
  return result.filter(p => p.createdAt >= startOfMonth).length;
}

// Mood templates
export async function getActiveMoodTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(moodTemplates).where(eq(moodTemplates.isActive, 1)).orderBy(moodTemplates.sortOrder);
}

export async function getAllMoodTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(moodTemplates).orderBy(moodTemplates.sortOrder);
}

export async function createMoodTemplate(template: InsertMoodTemplate) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(moodTemplates).values(template);
}

export async function updateMoodTemplate(id: number, template: Partial<InsertMoodTemplate>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(moodTemplates).set(template).where(eq(moodTemplates.id, id));
}

export async function deleteMoodTemplate(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(moodTemplates).where(eq(moodTemplates.id, id));
}

// Feedback
export async function createFeedback(feedbackData: InsertFeedback) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(feedback).values(feedbackData);
}
