import { useNavigate, useLocation } from "react-router";
import React from "react";
import { Button } from "./ui/button";
import { MessageSquare, User, Calendar, BookOpen, ClipboardList, Home, Users, LayoutDashboard, Shield, Settings, ChevronDown, Moon, Sun, ArrowLeftRight, ArrowLeft, CalendarClock, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useThemeContext } from "../contexts/ThemeContext";
import { useProfileMode } from "../contexts/ProfileModeContext";
import { mockMessages, mockCurrentTherapist, mockCurrentClient } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";

interface NavigationProps {
  userType?: "client" | "therapist";
  userName?: string;
  userAvatar?: string;
}

export default function Navigation({ userType = "client", userName, userAvatar }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeSettings, toggleAndSaveDarkMode, darkModeSupported } = useThemeContext();
  const { isClientMode, enterClientMode, exitClientMode } = useProfileMode();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Unread message count — refreshes on mockDataUpdated events
  const [msgTick, setMsgTick] = React.useState(0);
  React.useEffect(() => {
    const handler = () => setMsgTick(t => t + 1);
    window.addEventListener('mockDataUpdated', handler);
    return () => window.removeEventListener('mockDataUpdated', handler);
  }, []);

  const currentUserId = userType === "therapist"
    ? mockCurrentTherapist.id
    : mockCurrentClient.id;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unreadCount = React.useMemo(() => {
    return mockMessages.filter(
      m => m.receiverId === currentUserId && !m.read
    ).length;
  }, [currentUserId, msgTick]);

  const basePath = userType === "therapist" ? "/t" : "/c";
  const homePath = userType === "therapist" ? "/t" : "/c";
  const profilePath = `${basePath}/profile`;
  const calendarPath = `${basePath}/calendar`;
  const messagesPath = `${basePath}/messages`;
  const journalPath = userType === "therapist" ? `/t/journal` : `/c/journal`;
  const assessmentsPath = `${basePath}/assessments`;
  const clientsPath = `/t/clients`; // Therapist-only
  const supervisionPath = `/t/supervision`; // Therapist-only

  const isActive = (path: string) => {
    if (path === homePath) {
      return location.pathname === homePath;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Header - Desktop Full, Mobile Simplified */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 md:gap-3 cursor-pointer"
              onClick={() => navigate(homePath)}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm md:text-base">
                TC
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-base md:text-lg">Therapy Connect</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {userType === "therapist" ? "Therapist Dashboard" : isClientMode ? "Client Mode" : "Find Your Path to Wellness"}
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <Button
                variant={isActive(homePath) ? "default" : "ghost"}
                size="icon"
                onClick={() => navigate(homePath)}
                title="Dashboard"
                className="h-9 w-9 md:h-10 md:w-10"
              >
                <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant={isActive(calendarPath) ? "default" : "ghost"}
                size="icon"
                onClick={() => navigate(calendarPath)}
                title="Calendar"
                className="h-9 w-9 md:h-10 md:w-10"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant={isActive(messagesPath) ? "default" : "ghost"}
                size="icon"
                onClick={() => navigate(messagesPath)}
                title="Messages"
                className="h-9 w-9 md:h-10 md:w-10 relative"
              >
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
              {userType === "therapist" && (
                <Button
                  variant={isActive(clientsPath) ? "default" : "ghost"}
                  size="icon"
                  onClick={() => navigate(clientsPath)}
                  title="Clients"
                  className="h-9 w-9 md:h-10 md:w-10"
                >
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
              {userType === "therapist" && (
                <Button
                  variant={isActive(supervisionPath) ? "default" : "ghost"}
                  size="icon"
                  onClick={() => navigate(supervisionPath)}
                  title="Supervision"
                  className="h-9 w-9 md:h-10 md:w-10"
                >
                  <Shield className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
              <Button
                variant={isActive(journalPath) ? "default" : "ghost"}
                size="icon"
                onClick={() => navigate(journalPath)}
                title="Journal"
                className="h-9 w-9 md:h-10 md:w-10"
              >
                <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant={isActive(assessmentsPath) ? "default" : "ghost"}
                size="icon"
                onClick={() => navigate(assessmentsPath)}
                title="Assessments"
                className="h-9 w-9 md:h-10 md:w-10"
              >
                <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              {userAvatar && userName && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div 
                      className="flex items-center gap-2 ml-2 md:ml-4 cursor-pointer hover:opacity-80 transition-opacity"
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                      />
                      <div className="hidden md:flex items-center gap-1">
                        <div>
                          <p className="text-sm font-medium">{userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {userType === "therapist" ? "Therapist" : isClientMode ? "Client Mode" : "Client"}
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(profilePath)}>
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    {userType === "therapist" && (
                      <>
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/settings`)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`${calendarPath}?editAvailability=1`)}>
                          <CalendarClock className="w-4 h-4 mr-2" />
                          Edit Availability
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    {userType === "therapist" && (
                      <>
                        <DropdownMenuItem onClick={() => {
                          enterClientMode();
                          navigate("/c");
                        }}>
                          <ArrowLeftRight className="w-4 h-4 mr-2" />
                          Switch to Client Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {userType === "client" && isClientMode && (
                      <>
                        <DropdownMenuItem onClick={() => {
                          exitClientMode();
                          navigate("/t");
                        }}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Therapist Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {darkModeSupported && (
                      <DropdownMenuItem onClick={toggleAndSaveDarkMode}>
                        {themeSettings.darkMode ? (
                          <>
                            <Sun className="w-4 h-4 mr-2" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 mr-2" />
                            Dark Mode
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Profile Only */}
            <div className="md:hidden">
              {userAvatar && userName && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div 
                      className="cursor-pointer"
                      title="Profile menu"
                    >
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(profilePath)}>
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    {userType === "therapist" && (
                      <DropdownMenuItem onClick={() => navigate(`${basePath}/settings`)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    )}
                    {userType === "therapist" && (
                      <DropdownMenuItem onClick={() => navigate(`${calendarPath}?editAvailability=1`)}>
                        <CalendarClock className="w-4 h-4 mr-2" />
                        Edit Availability
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {userType === "therapist" && (
                      <>
                        <DropdownMenuItem onClick={() => {
                          enterClientMode();
                          navigate("/c");
                        }}>
                          <ArrowLeftRight className="w-4 h-4 mr-2" />
                          Switch to Client Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {userType === "client" && isClientMode && (
                      <>
                        <DropdownMenuItem onClick={() => {
                          exitClientMode();
                          navigate("/t");
                        }}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Therapist Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {darkModeSupported && (
                      <DropdownMenuItem onClick={toggleAndSaveDarkMode}>
                        {themeSettings.darkMode ? (
                          <>
                            <Sun className="w-4 h-4 mr-2" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 mr-2" />
                            Dark Mode
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-bottom">
        <div className={`grid gap-1 px-2 py-2 ${userType === "therapist" ? "grid-cols-6" : "grid-cols-5"}`}>
          <button
            onClick={() => navigate(homePath)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive(homePath) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button
            onClick={() => navigate(calendarPath)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive(calendarPath) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Calendar</span>
          </button>
          
          <button
            onClick={() => navigate(messagesPath)}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive(messagesPath) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Messages</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-0.5 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5 leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {userType !== "therapist" && (
            <button
              onClick={() => navigate(journalPath)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                isActive(journalPath) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Journal</span>
            </button>
          )}

          {userType === "therapist" && (
            <button
              onClick={() => navigate(supervisionPath)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                isActive(supervisionPath) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Supervise</span>
            </button>
          )}

          {userType === "therapist" && (
            <button
              onClick={() => navigate(clientsPath)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                isActive(clientsPath) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Clients</span>
            </button>
          )}
          
          <button
            onClick={() => navigate(profilePath)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive(profilePath) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}