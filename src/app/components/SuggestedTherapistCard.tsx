import { Therapist } from "../data/mockData";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";

interface SuggestedTherapistCardProps {
  therapist: Therapist;
  isFollowing: boolean;
  onToggleFollow: (therapistId: string, isFollowing: boolean) => void;
}

export default function SuggestedTherapistCard({ 
  therapist, 
  isFollowing: initialIsFollowing,
  onToggleFollow 
}: SuggestedTherapistCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const navigate = useNavigate();
  const location = useLocation();
  const routePrefix = location.pathname.startsWith('/t') ? '/t' : '/c';

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    onToggleFollow(therapist.id, newFollowingState);
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`${routePrefix}/therapist/${therapist.id}`)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <img
              src={therapist.avatar}
              alt={therapist.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{therapist.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {therapist.credentials}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {therapist.specializations.slice(0, 2).map((spec, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {therapist.specializations.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{therapist.specializations.length - 2}
              </Badge>
            )}
          </div>

          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className="w-full"
            onClick={handleToggleFollow}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3 h-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}