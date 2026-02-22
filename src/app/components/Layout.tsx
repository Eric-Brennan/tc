import { ReactNode } from "react";
import Navigation from "./Navigation";
import UserTypeToggle from "./UserTypeToggle";
import MobileViewToggle from "./MobileViewToggle";

interface LayoutProps {
  children: ReactNode;
  userType?: "client" | "therapist";
  userName?: string;
  userAvatar?: string;
  showNavigation?: boolean;
}

export default function Layout({ 
  children, 
  userType = "client", 
  userName, 
  userAvatar,
  showNavigation = true 
}: LayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {showNavigation && (
        <Navigation 
          userType={userType} 
          userName={userName} 
          userAvatar={userAvatar} 
        />
      )}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <UserTypeToggle />
      <MobileViewToggle />
    </div>
  );
}