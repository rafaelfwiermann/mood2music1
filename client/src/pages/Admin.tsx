import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, Music, CreditCard, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const stats = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const users = trpc.admin.getUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const playlists = trpc.admin.getAllPlaylists.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, authLoading, user, setLocation]);

  if (authLoading || stats.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Admin Panel - {APP_TITLE}</h1>
            </div>
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Users</CardDescription>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="text-3xl">{stats.data?.totalUsers || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Playlists</CardDescription>
                <Music className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="text-3xl">{stats.data?.totalPlaylists || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active Subscriptions</CardDescription>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="text-3xl">{stats.data?.activeSubscriptions || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data?.slice(0, 10).map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name || "—"}</td>
                      <td className="py-3 px-4">{user.email || "—"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Playlists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Playlists</CardTitle>
            <CardDescription>Latest created playlists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Vibe</th>
                    <th className="text-left py-3 px-4">Mood</th>
                    <th className="text-left py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {playlists.data?.slice(0, 20).map((playlist) => (
                    <tr key={playlist.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{playlist.title || "Untitled"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                        {playlist.vibeDescription || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {playlist.moodType && (
                          <Badge variant="outline">{playlist.moodType}</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(playlist.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
