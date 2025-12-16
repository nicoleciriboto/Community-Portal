import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2, Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Event {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    creator_id: string;
}

interface EventDetailDialogProps {
    event: Event | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isRegistered: boolean;
    isOwner: boolean;
    onRegister: () => void;
    onUnregister: () => Promise<void>;
    onDelete: () => Promise<void>;
}

export default function EventDetailDialog({
    event,
    open,
    onOpenChange,
    isRegistered,
    isOwner,
    onRegister,
    onUnregister,
    onDelete,
}: EventDetailDialogProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!event) return null;

    const handleRegisterAction = async () => {
        setLoading(true);
        try {
            if (isRegistered) {
                await onUnregister();
                toast({ title: 'Unregistered from event' });
            } else {
                onRegister(); // Opens verification dialog in parent, no await needed here for "success" yet
                onOpenChange(false); // Close details to show verification
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

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        setLoading(true);
        try {
            await onDelete();
            toast({ title: 'Event deleted' });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete event',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <DialogTitle className="text-xl">{event.title}</DialogTitle>
                        {isRegistered && <Badge variant="secondary">Registered</Badge>}
                    </div>
                    <DialogDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.event_date), 'MMMM d, yyyy')}
                        <Clock className="h-4 w-4 ml-2" />
                        {format(new Date(event.event_date), 'h:mm a')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {event.description || 'No description provided.'}
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {isOwner && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                            className="sm:mr-auto"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Event
                        </Button>
                    )}

                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>

                    <Button
                        variant={isRegistered ? 'secondary' : 'default'}
                        onClick={handleRegisterAction}
                        disabled={loading}
                    >
                        {isRegistered ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Unregister
                            </>
                        ) : (
                            'Register Now'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
