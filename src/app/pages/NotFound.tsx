import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="w-4 h-4" />
            Client Home
          </Button>
          <Button onClick={() => navigate('/t')} variant="outline">
            Therapist Home
          </Button>
        </div>
      </div>
    </div>
  );
}
