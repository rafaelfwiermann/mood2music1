import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Music, Sparkles, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Welcome() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const spotifyStatus = trpc.spotify.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // If user is logged in and Spotify is connected, redirect to dashboard
    if (isAuthenticated && spotifyStatus.data?.connected) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, spotifyStatus.data, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Music className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your vibe. Our soundtrack.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Playlists</h3>
                  <p className="text-sm text-gray-600">
                    Transform your emotions into personalized Spotify playlists with AI
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Get music that matches your mood, energy, and vibe perfectly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Instant Creation</h3>
                  <p className="text-sm text-gray-600">
                    Playlists created directly in your Spotify account in seconds
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in but Spotify not connected - show onboarding
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold">Welcome to {APP_TITLE}</CardTitle>
          <CardDescription className="text-base">
            Connect your Spotify account to start creating mood-based playlists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="font-semibold text-lg mb-2">Connect with Spotify</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll create playlists directly in your Spotify account based on your mood
            </p>
            <ConnectSpotifyButton />
          </div>

          <p className="text-sm text-gray-500 mt-4">
            By connecting, you allow Mood2Music to create and modify playlists in your Spotify account
          </p>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-3">Want to see what others are creating?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/explore")}
            >
              Explore Community Vibes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectSpotifyButton() {
  const authUrl = trpc.spotify.getAuthUrl.useQuery();

  if (authUrl.isLoading) {
    return (
      <Button size="lg" disabled className="bg-green-600">
        Loading...
      </Button>
    );
  }

  if (!authUrl.data?.url) {
    return (
      <Button size="lg" disabled className="bg-green-600">
        Error loading Spotify
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="bg-green-600 hover:bg-green-700 text-white font-semibold"
      onClick={() => (window.location.href = authUrl.data.url)}
    >
      <Music className="w-5 h-5 mr-2" />
      Connect with Spotify
    </Button>
  );
}
