import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Loader2, Music, Plus, Settings, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const playlists = trpc.playlists.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const subscription = trpc.subscription.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const monthlyCount = trpc.subscription.getMonthlyCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const togglePublicMutation = trpc.playlists.togglePublic.useMutation({
    onSuccess: () => {
      playlists.refetch();
      toast.success("Playlist visibility updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const spotifyStatus = trpc.spotify.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  useEffect(() => {
    if (spotifyStatus.data && !spotifyStatus.data.connected) {
      setLocation("/");
    }
  }, [spotifyStatus.data, setLocation]);

  if (authLoading || playlists.isLoading || subscription.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const isFree = !subscription.data || subscription.data.planType === "free";
  const playlistsThisMonth = monthlyCount.data?.count || 0;
  const remainingPlaylists = isFree ? Math.max(0, 5 - playlistsThisMonth) : Infinity;

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
              <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              {user?.role === "admin" && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
                  <Settings className="w-4 h-4 mr-1" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subscription Banner */}
        {isFree && (
          <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Upgrade to Pro
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Unlimited playlists, advanced features, and more
                  </CardDescription>
                </div>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Upgrade Now
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Plan</CardDescription>
              <CardTitle className="text-2xl">
                {isFree ? "Free" : "Pro"}
                {isFree && (
                  <Badge variant="outline" className="ml-2">
                    {remainingPlaylists} left this month
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Playlists</CardDescription>
              <CardTitle className="text-2xl">{playlists.data?.length || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-2xl">{playlistsThisMonth}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Create Buttons */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setLocation("/analyze-history")}
              size="lg"
              disabled={isFree && remainingPlaylists === 0}
              className="h-auto py-6 flex-col items-start text-left bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Analyze My History</h3>
              <p className="text-sm text-white/80 font-normal">
                Let AI analyze your Spotify listening history
              </p>
            </Button>

            <Button
              onClick={() => setLocation("/create")}
              size="lg"
              disabled={isFree && remainingPlaylists === 0}
              className="h-auto py-6 flex-col items-start text-left bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white border-0"
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Describe My Vibe</h3>
              <p className="text-sm text-white/80 font-normal">
                Tell us how you're feeling right now
              </p>
            </Button>
          </div>
          {isFree && remainingPlaylists === 0 && (
            <p className="text-sm text-red-600 mt-3 text-center">
              You've reached your monthly limit. Upgrade to Pro for unlimited playlists.
            </p>
          )}
        </div>

        {/* Playlists Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
          {playlists.data && playlists.data.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.data.map((playlist) => (
                <Card key={playlist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {playlist.coverImageUrl && (
                    <div className="aspect-square relative">
                      <img
                        src={playlist.coverImageUrl}
                        alt={playlist.title || "Playlist"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">
                      {playlist.title || "Untitled Playlist"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {playlist.description || playlist.vibeDescription}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                      {playlist.moodType && (
                        <Badge variant="secondary" className="text-xs">
                          {playlist.moodType}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          window.open(
                            `https://open.spotify.com/playlist/${playlist.spotifyPlaylistId}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublicMutation.mutate({ playlistId: playlist.id })}
                      >
                        {playlist.isPublic === 1 ? "Make Private" : "Make Public"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
              <p className="text-gray-600 mb-6">Create your first mood-based playlist using one of the options above!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
