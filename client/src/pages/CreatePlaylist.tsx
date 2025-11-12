import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Music, Sparkles } from "lucide-react";
import AnalyzeHistory from "./AnalyzeHistory";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const MOOD_CHIPS = [
  { label: "Relaxed", emoji: "😌" },
  { label: "Energetic", emoji: "⚡" },
  { label: "Romantic", emoji: "💕" },
  { label: "Focused", emoji: "🎯" },
  { label: "Travel", emoji: "✈️" },
  { label: "Party", emoji: "🎉" },
  { label: "Rainy Drive", emoji: "🌧️" },
  { label: "Morning Wake-up", emoji: "☀️" },
  { label: "Night Wind-down", emoji: "🌙" },
];

export default function CreatePlaylist() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get("mode") || "vibe";

  const [vibeDescription, setVibeDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [parameters, setParameters] = useState({
    energy: 0.5,
    valence: 0.5,
    tempo: 120,
    genres: [] as string[],
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

  const handleMoodChipClick = (mood: string) => {
    setVibeDescription(mood);
  };

  const analyzeVibeMutation = trpc.generate.analyzeVibe.useMutation({
    onSuccess: (data) => {
      setParameters({
        energy: data.parameters.energy,
        valence: data.parameters.valence,
        tempo: data.parameters.tempo,
        genres: data.parameters.genres,
      });
      setShowPreview(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAnalyzeVibe = () => {
    if (!vibeDescription.trim()) {
      toast.error("Please describe your vibe first");
      return;
    }
    analyzeVibeMutation.mutate({ vibeDescription });
  };

  if (authLoading || spotifyStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Redirect to analyze history if mode is analyze
  useEffect(() => {
    if (mode === "analyze") {
      setLocation("/analyze-history");
    }
  }, [mode, setLocation]);

  if (mode === "analyze") {
    return null;
  }

  if (showPreview) {
    return (
      <PreviewParameters
        vibeDescription={vibeDescription}
        parameters={parameters}
        onEdit={() => setShowPreview(false)}
        onGenerate={(params: any) => {
          sessionStorage.setItem("playlistParams", JSON.stringify(params));
          setLocation("/generating");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Describe Your Vibe</CardTitle>
            <CardDescription className="text-base">
              Tell us how you're feeling or what you're doing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vibe">How are you feeling or what setting are you in?</Label>
              <Textarea
                id="vibe"
                placeholder="e.g., sunset by the sea, late-night drive in the rain, focused study session..."
                value={vibeDescription}
                onChange={(e) => setVibeDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label>Or choose a mood:</Label>
              <div className="flex flex-wrap gap-2">
                {MOOD_CHIPS.map((mood) => (
                  <Button
                    key={mood.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoodChipClick(mood.label)}
                    className={`${
                      vibeDescription === mood.label
                        ? "bg-purple-100 border-purple-300"
                        : "hover:bg-purple-50"
                    }`}
                  >
                    <span className="mr-1">{mood.emoji}</span>
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setLocation("/onboarding")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleAnalyzeVibe}
                disabled={!vibeDescription.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// AnalyzeHistory component moved to separate file

interface PreviewParametersProps {
  vibeDescription: string;
  parameters: {
    energy: number;
    valence: number;
    tempo: number;
    genres: string[];
  };
  onEdit: () => void;
  onGenerate: (params: any) => void;
}

function PreviewParameters({ vibeDescription, parameters, onEdit, onGenerate }: PreviewParametersProps) {
  const [energy, setEnergy] = useState(parameters.energy);
  const [valence, setValence] = useState(parameters.valence);
  const [tempo, setTempo] = useState(parameters.tempo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Preview Your Playlist</CardTitle>
            <CardDescription>
              AI analyzed your vibe: "{vibeDescription}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Energy Level</Label>
                  <span className="text-sm text-gray-600">{Math.round(energy * 100)}%</span>
                </div>
                <Slider
                  value={[energy * 100]}
                  onValueChange={([val]) => setEnergy(val / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Mood (Happiness)</Label>
                  <span className="text-sm text-gray-600">{Math.round(valence * 100)}%</span>
                </div>
                <Slider
                  value={[valence * 100]}
                  onValueChange={([val]) => setValence(val / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tempo (BPM)</Label>
                  <span className="text-sm text-gray-600">{tempo}</span>
                </div>
                <Slider
                  value={[tempo]}
                  onValueChange={([val]) => setTempo(val)}
                  min={60}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {parameters.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onEdit} className="flex-1">
                Edit Vibe
              </Button>
              <Button
                onClick={() => onGenerate({
                  vibeDescription,
                  parameters: {
                    energy,
                    valence,
                    tempo,
                    genres: parameters.genres,
                  },
                })}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Music className="w-4 h-4 mr-2" />
                Generate Playlist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
