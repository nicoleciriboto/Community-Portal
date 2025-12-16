import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, Plus, Users } from 'lucide-react';
import PostCard from '@/components/PostCard';
import PostForm from '@/components/PostForm';
import EventCard from '@/components/EventCard';
import EventForm from '@/components/EventForm';
import UserSummary from '@/components/UserSummary';
import EventDetailDialog from '@/components/EventDetailDialog';
import VerificationDialog from '@/components/VerificationDialog';
import { sendVerificationEmail } from '@/utils/emailService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  profiles?: { name: string } | null;
}

interface Event {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Verification State
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    eventId: string;
    eventTitle: string;
    code: string;
  } | null>(null);

  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    await Promise.all([fetchPosts(), fetchEvents(), fetchRegistrations()]);
    setLoadingData(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data as Post[]);
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5);

    if (data) {
      setEvents(data);
    }
  };

  const fetchRegistrations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', user.id);

    if (data) {
      setRegisteredEventIds(new Set(data.map(r => r.event_id)));
    }
  };

  const handlePostCreated = () => {
    setPostDialogOpen(false);
    setEditingPost(null);
    fetchPosts();
  };

  const handleEventCreated = () => {
    setEventDialogOpen(false);
    fetchEvents();
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostDialogOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    fetchPosts();
  };

  const handleRegister = async (eventId: string, eventTitle: string) => {
    if (!user) return;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending state
    setPendingRegistration({
      eventId,
      eventTitle,
      code
    });

    // Send email
    // Note: We don't await this to keep UI snappy, or we could await if we want to ensure send.
    // For better UX during "fake" send, let's just trigger it.
    // In real app maybe show loading.
    console.log('Sending verification to:', user.email);
    sendVerificationEmail(user.email || '', code, eventTitle);

    // Open dialog
    setVerificationOpen(true);
  };

  const handleVerify = async (inputCode: string) => {
    if (!user || !pendingRegistration) return;

    if (inputCode !== pendingRegistration.code) {
      throw new Error("Invalid verification code");
    }

    // Proceed with registration
    await supabase.from('event_registrations').insert({
      event_id: pendingRegistration.eventId,
      user_id: user.id,
    });

    fetchRegistrations();
    setVerificationOpen(false);
    setPendingRegistration(null);
  };

  const handleUnregister = async (eventId: string) => {
    if (!user) return;

    await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    fetchRegistrations();
  };

  const handleDeleteEvent = async (eventId: string) => {
    await supabase.from('events').delete().eq('id', eventId);
    if (viewingEvent?.id === eventId) setViewingEvent(null);
    fetchEvents();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Community Portal</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Community Feed</h2>
              <Dialog open={postDialogOpen} onOpenChange={(open) => {
                setPostDialogOpen(open);
                if (!open) setEditingPost(null);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
                  </DialogHeader>
                  <PostForm
                    post={editingPost}
                    onSuccess={handlePostCreated}
                    onCancel={() => {
                      setPostDialogOpen(false);
                      setEditingPost(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <PostCard
                      post={post}
                      authorName={post.profiles?.name || 'Unknown'}
                      isOwner={post.user_id === user.id}
                      onEdit={() => handleEditPost(post)}
                      onDelete={() => handleDeletePost(post.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UserSummary profile={profile} />

            {/* Events Section */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upcoming Events</h3>
                <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Event</DialogTitle>
                    </DialogHeader>
                    <EventForm onSuccess={handleEventCreated} />
                  </DialogContent>
                </Dialog>
              </div>

              {loadingData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isRegistered={registeredEventIds.has(event.id)}
                      isOwner={user.id === event.creator_id}
                      onRegister={() => handleRegister(event.id, event.title)}
                      onUnregister={() => handleUnregister(event.id)}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onClick={() => setViewingEvent(event)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <VerificationDialog
        open={verificationOpen}
        onOpenChange={setVerificationOpen}
        onVerify={handleVerify}
        userEmail={user?.email || ''}
      />

      <EventDetailDialog
        event={viewingEvent}
        open={!!viewingEvent}
        onOpenChange={(open) => !open && setViewingEvent(null)}
        isRegistered={viewingEvent ? registeredEventIds.has(viewingEvent.id) : false}
        isOwner={viewingEvent ? user.id === viewingEvent.creator_id : false}
        onRegister={() => viewingEvent && handleRegister(viewingEvent.id, viewingEvent.title)}
        onUnregister={() => viewingEvent && handleUnregister(viewingEvent.id)}
        onDelete={() => viewingEvent && handleDeleteEvent(viewingEvent.id)}
      />
    </div>
  );
}
