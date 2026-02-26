import { useNavigate, useLocation } from "react-router";
import { Post, mockTherapists } from "../data/mockData";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, ExternalLink } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const navigate = useNavigate();
  const location = useLocation();
  const routePrefix = location.pathname.startsWith('/t') ? '/t' : '/c';
  
  const therapist = mockTherapists.find(t => t.id === post.therapistId);
  
  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const handleTherapistClick = () => {
    navigate(`${routePrefix}/therapist/${post.therapistId}`);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex gap-3">
          <img
            src={therapist?.avatar}
            alt={therapist?.name}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={handleTherapistClick}
          />
          <div className="min-w-0 flex-1">
            <h4 
              className="font-semibold cursor-pointer hover:underline truncate"
              onClick={handleTherapistClick}
            >
              {therapist?.name}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{therapist?.credentials}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatTimestamp(post.timestamp)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
        <p className="whitespace-pre-line text-sm md:text-base">{post.content}</p>
        
        {post.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            Read more
          </a>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className="gap-2"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            <span className="sm:hidden">{likeCount}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}