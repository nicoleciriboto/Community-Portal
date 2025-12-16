import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, User } from 'lucide-react';
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

interface Post {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

interface PostCardProps {
  post: Post;
  authorName: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PostCard({ post, authorName, isOwner, onEdit, onDelete }: PostCardProps) {
  return (
    <article className="glass-card rounded-xl overflow-hidden">
      {post.image_url && (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <img
            src={post.image_url}
            alt={post.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">{post.title}</h3>
            {post.description && (
              <p className="text-muted-foreground text-sm mb-3">{post.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{authorName}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
