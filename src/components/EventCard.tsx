import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
}

interface EventCardProps {
  event: Event;
  isRegistered: boolean;
  isOwner: boolean;
  onRegister: () => Promise<void>;
  onUnregister: () => Promise<void>;
  onDelete: () => Promise<void>;
  onClick: () => void;
}

export default function EventCard({
  event,
  isRegistered,
  isOwner,
  onRegister,
  onUnregister,
  onDelete,
  onClick
}: EventCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleRegistration = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening details
    setLoading(true);
    try {
      if (isRegistered) {
        await onUnregister();
        toast({ title: 'Unregistered from event' });
      } else {
        await onRegister();
        // Toast handled in parent after verification
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /* handleDelete removed in favor of AlertDialogAction */

  return (
    <div
      className="p-4 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-foreground">{event.title}</h4>
      </div>

      {event.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}</span>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="flex items-center gap-1">
            {isRegistered ? (
              <>
                <Badge variant="secondary" className="h-7 px-2 font-normal">
                  <Check className="h-3 w-3 mr-1" />
                  Registered
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Unregister from this event?')) {
                      onUnregister();
                    }
                  }}
                  disabled={loading}
                  title="Unregister"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleToggleRegistration}
                disabled={loading}
                className="h-7 text-xs"
              >
                Register
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
