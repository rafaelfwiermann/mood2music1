import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Music, TrendingUp, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AnalyzeHistory() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [analyzing, setAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeHistoryMutation = trpc.generate.analyzeHistory.useMutation({
    onSuccess: (data) => {
      setAnalysis(data);
      setAnalyzing(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setAnalyzing(false);
      setTimeout(() => setLocation("/onboarding"), 2000);
    },
  });

  const createPlaylistMutation = trpc.generate.createPlaylist.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("generatedPlaylist", JSON.stringify(data.playlist));
      setLocation("/result");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
      return;
    }

    if (analyzing && isAuthenticated) {
      analyzeHistoryMutation.mutate();
    }
  }, [authLoading, isAuthenticated, analyzing]);

  const handleGeneratePlaylist = () => {
    if (!analysis) return;

    const vibeDescription = `Based on your music taste: ${analysis.insights}`;
    
    createPlaylistMutation.mutate({
      vibeDescription,
      parameters: {
        energy: 0.6,
        valence: 0.6,
        tempo: 120,
        genres: analysis.genres.slice(0, 3),
        acousticness: 0.5,
        danceability: 0.6,
      },
      useHistory: true,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Analyzing Your Music Taste</CardTitle>
            <CardDescription className="text-base">
              We're analyzing your Spotify listening history...
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-700">Fetching your top tracks...</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-700">Analyzing your favorite artists...</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-gray-700">Identifying your music preferences...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error loading analysis</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Your Music Profile</CardTitle>
            <CardDescription className="text-base">
              Based on your Spotify listening history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Insights */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Your Music Taste
              </h3>
              <p className="text-gray-700">{analysis.insights}</p>
            </div>

            {/* Preferred Genres */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Your Favorite Genres</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.genres.map((genre: string) => (
                  <Badge key={genre} variant="secondary" className="text-sm px-3 py-1">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setLocation("/onboarding")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleGeneratePlaylist}
                disabled={createPlaylistMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {createPlaylistMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 mr-2" />
                    Create Playlist from History
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
