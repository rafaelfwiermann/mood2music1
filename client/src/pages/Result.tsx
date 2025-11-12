import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Music, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Result() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedPlaylist");
    if (stored) {
      setResult(JSON.parse(stored));
      sessionStorage.removeItem("generatedPlaylist");
    } else {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
            Based on your music taste
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
