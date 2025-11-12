import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Loader2, Music, Share2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function GeneratePlaylist() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [generating, setGenerating] = useState(true);
  const [result, setResult] = useState<any>(null);

  // Get parameters from session storage (set by CreatePlaylist page)
  const [params] = useState(() => {
    const stored = sessionStorage.getItem("playlistParams");
    if (stored) {
      sessionStorage.removeItem("playlistParams");
      return JSON.parse(stored);
    }
    return null;
  });

  const createPlaylistMutation = trpc.generate.createPlaylist.useMutation({
    onSuccess: (data) => {
      setResult(data.playlist);
      setGenerating(false);
      toast.success("Playlist created successfully!");
    },
    onError: (error) => {
      setGenerating(false);
      toast.error(error.message);
      setTimeout(() => setLocation("/create"), 2000);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
      return;
    }

    if (!params) {
      setLocation("/create");
      return;
    }

    // Start generation
    if (generating && params) {
      createPlaylistMutation.mutate({
        vibeDescription: params.vibeDescription,
        parameters: params.parameters,
        useHistory: params.useHistory || false,
      });
    }
  }, [authLoading, isAuthenticated, params, generating]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Creating Your Soundtrack</CardTitle>
            <CardDescription className="text-base">
              AI is analyzing your vibe and finding the perfect tracks...
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-700">Analyzing your vibe with AI...</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-700">Finding perfect tracks on Spotify...</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-700">Generating custom cover art...</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-700">Creating playlist in your Spotify account...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error loading result</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center mb-4">
            <Music className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Your Soundtrack is Ready!</CardTitle>
          <CardDescription className="text-base">
            {params.vibeDescription && `For: "${params.vibeDescription}"`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.coverImage && (
            <div className="flex justify-center">
              <img
                src={result.coverImage}
                alt={result.title}
                className="w-64 h-64 rounded-lg shadow-lg object-cover"
              />
            </div>
          )}

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{result.title}</h3>
            <p className="text-gray-600">{result.description}</p>
          </div>

          <div className="grid gap-3">
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              onClick={() => window.open(result.url, "_blank")}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open in Spotify
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(result.url);
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={() => setLocation("/create")}>
                Try Another Vibe
              </Button>
            </div>

            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
