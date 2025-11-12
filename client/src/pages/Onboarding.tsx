import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Brain, History, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const spotifyStatus = trpc.spotify.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    if (spotifyStatus.data && !spotifyStatus.data.connected) {
      setLocation("/");
    }
  }, [spotifyStatus.data, setLocation]);

  if (loading || spotifyStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <Card className="max-w-3xl w-full shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">You're all set!</CardTitle>
          <CardDescription className="text-base">
            Choose how you want to create your first playlist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-300"
              onClick={() => setLocation("/create?mode=analyze")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Analyze My History</CardTitle>
                <CardDescription>
                  Let AI analyze your Spotify listening history to understand your taste and create
                  a personalized playlist
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-pink-300"
              onClick={() => setLocation("/create?mode=vibe")}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
                  <Brain className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-xl">Describe My Vibe</CardTitle>
                <CardDescription>
                  Tell us how you're feeling or what you're doing, and we'll create the perfect
                  soundtrack for the moment
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="pt-4 text-center">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              Skip to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
