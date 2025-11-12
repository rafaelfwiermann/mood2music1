import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Loader2, Music, Play, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Explore() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const publicPlaylists = trpc.playlists.public.useQuery();
  const incrementPlayCount = trpc.playlists.incrementPlayCount.useMutation();

  const handlePlayPlaylist = (playlistId: number, spotifyId: string) => {
    incrementPlayCount.mutate({ playlistId });
    window.open(`https://open.spotify.com/playlist/${spotifyId}`, "_blank");
  };

  const handleUseVibe = (vibeDescription: string, parameters: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to create playlists");
      setLocation("/");
      return;
    }

    try {
      const params = JSON.parse(parameters);
      sessionStorage.setItem(
        "playlistParams",
        JSON.stringify({
          vibeDescription,
          parameters: params,
        })
      );
      setLocation("/create");
    } catch (error) {
      toast.error("Failed to load vibe parameters");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
                <p className="text-sm text-gray-600">Explore Community Vibes</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isAuthenticated ? "Dashboard" : "Home"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Discover Public Vibes</h2>
          <p className="text-gray-600">
            Explore playlists created by the community and find your next favorite vibe
          </p>
        </div>

        {publicPlaylists.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : publicPlaylists.data && publicPlaylists.data.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPlaylists.data.map((playlist) => (
              <Card key={playlist.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {playlist.coverImageUrl && (
                  <div className="aspect-square relative group">
                    <img
                      src={playlist.coverImageUrl}
                      alt={playlist.title || "Playlist"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
                        onClick={() => handlePlayPlaylist(playlist.id, playlist.spotifyPlaylistId || "")}
                      >
                        <Play className="w-8 h-8 text-white fill-white" />
                      </Button>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">
                    {playlist.title || "Untitled Playlist"}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {playlist.vibeDescription || playlist.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    {playlist.moodType && (
                      <Badge variant="secondary" className="text-xs">
                        {playlist.moodType}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {playlist.playCount || 0} plays
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handlePlayPlaylist(playlist.id, playlist.spotifyPlaylistId || "")}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseVibe(playlist.vibeDescription || "", playlist.parameters || "{}")}
                    >
                      Use This Vibe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No public playlists yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your vibe with the community!
            </p>
            {isAuthenticated && (
              <Button
                onClick={() => setLocation("/create")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Create & Share Your Vibe
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
