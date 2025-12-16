import { User, Mail, Phone } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  avatar_url: string | null;
}

interface UserSummaryProps {
  profile: Profile | null;
}

export default function UserSummary({ profile }: UserSummaryProps) {
  if (!profile) return null;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <User className="h-7 w-7 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{profile.name || 'User'}</h3>
          <p className="text-sm text-muted-foreground">Community Member</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="truncate">{profile.email}</span>
        </div>
        {profile.mobile && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{profile.mobile}</span>
          </div>
        )}
      </div>
    </div>
  );
}
