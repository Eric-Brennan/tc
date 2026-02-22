import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { User, Stethoscope } from "lucide-react";

export default function UserTypeToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<'client' | 'therapist'>('client');

  useEffect(() => {
    // Determine user type based on current route
    if (location.pathname.startsWith('/t')) {
      setUserType('therapist');
    } else {
      setUserType('client');
    }
  }, [location.pathname]);

  const handleToggle = () => {
    if (userType === 'client') {
      setUserType('therapist');
      navigate('/t');
    } else {
      setUserType('client');
      navigate('/');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleToggle}
        className="rounded-full h-14 w-14 shadow-lg"
        size="icon"
        title={`Switch to ${userType === 'client' ? 'Therapist' : 'Client'} View`}
      >
        {userType === 'client' ? (
          <Stethoscope className="h-6 w-6" />
        ) : (
          <User className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
