import { InSessionAssessment } from "../components/InSessionAssessment";
import { ClientSessionTools } from "../components/ClientSessionTools";
import { useIsMobileView } from "../hooks/useIsMobileView";
import MobileViewToggle from "../components/MobileViewToggle";
import { useParams, useNavigate, useLocation } from "react-router";
import { mockVideoSessions, mockTherapists, mockClients } from "../data/mockData";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff,
  Monitor,
  Settings,
  ClipboardList,
  StickyNote
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function VideoSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobileView();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [clientToolsOpen, setClientToolsOpen] = useState(false);

  const isTherapist = location.pathname.startsWith('/t/');
  const sidebarOpen = isTherapist ? assessmentOpen : clientToolsOpen;

  const session = mockVideoSessions.find(s => s.id === sessionId);
  const therapist = session ? mockTherapists.find(t => t.id === session.therapistId) : null;
  const client = session ? mockClients.find(c => c.id === session.clientId) : null;

  // From the therapist's perspective, the remote participant is the client and vice versa
  const remoteParticipant = isTherapist ? client : therapist;
  const localParticipant = isTherapist ? therapist : client;

  useEffect(() => {
    // Simulate connection
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
      toast.success("Connected to video session");
    }, 2000);

    // Session duration timer
    const durationTimer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(durationTimer);
    };
  }, []);

  if (!session || !therapist || !client || !remoteParticipant || !localParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Session not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      toast.success("Session ended");
      navigate(-1);
    }
  };

  // === MOBILE LAYOUT ===
  if (isMobile) {
    return (
      <>
        <MobileViewToggle />
        {/* Override mobile-simulation-body styles that conflict with video session */}
        <style>{`
          .mobile-simulation-body {
            background: black !important;
            padding-bottom: 0 !important;
          }
        `}</style>
        <div className="relative h-screen w-full overflow-hidden bg-black flex flex-col">
          {/* Full-screen remote participant */}
          <div className="absolute inset-0">
            <img
              src={remoteParticipant.avatar}
              alt={remoteParticipant.name}
              className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30"
            />
            {isConnecting ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-sm">Connecting...</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl mb-3 mx-auto">
                    {remoteParticipant.name.charAt(0)}
                  </div>
                  <p className="font-medium text-lg">{remoteParticipant.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Top overlay: duration + session info */}
          <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {formatDuration(sessionDuration)}
            </div>
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs">
              {session.duration} min
            </div>
          </div>

          {/* Floating local participant (PiP) */}
          <div className="absolute top-16 right-3 z-10 w-[100px] h-[140px] rounded-xl overflow-hidden border-2 border-white/20 shadow-xl bg-gray-900">
            <img
              src={localParticipant.avatar}
              alt={localParticipant.name}
              className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30"
            />
            {isVideoOff ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg mx-auto">
                    {localParticipant.name.charAt(0)}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">Camera off</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-lg mx-auto">
                    {localParticipant.name.charAt(0)}
                  </div>
                  <p className="text-[10px] mt-1">You</p>
                </div>
              </div>
            )}
            {isMuted && (
              <div className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full">
                <MicOff className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Bottom controls overlay */}
          <div className="relative z-10 mt-auto px-4 pb-6 pt-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* Remote participant name label */}
            {!isConnecting && (
              <div className="text-center mb-4">
                <span className="text-white/70 text-xs">{remoteParticipant.name}</span>
              </div>
            )}

            <div className="flex justify-center items-center gap-3">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-full w-12 h-12"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className="rounded-full w-12 h-12"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndCall}
                className="rounded-full w-14 h-14"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>

              {/* Assessment/tools button — therapist only */}
              {isTherapist && (
                <Button
                  variant={assessmentOpen ? "default" : "secondary"}
                  size="lg"
                  onClick={() => setAssessmentOpen(!assessmentOpen)}
                  className={`rounded-full w-12 h-12 ${assessmentOpen ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  title="In-session tools"
                >
                  <ClipboardList className="w-5 h-5" />
                </Button>
              )}

              {/* Notes/chat button — client only */}
              {!isTherapist && (
                <Button
                  variant={clientToolsOpen ? "default" : "secondary"}
                  size="lg"
                  onClick={() => setClientToolsOpen(!clientToolsOpen)}
                  className={`rounded-full w-12 h-12 ${clientToolsOpen ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                  title="Session tools"
                >
                  <StickyNote className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Azure note */}
            <p className="text-[10px] text-gray-500 text-center mt-3">
              Powered by Azure Communication Services
            </p>
          </div>

          {/* Assessment Sidebar — therapist only (absolute within container on mobile) */}
          {isTherapist && (
            <InSessionAssessment
              open={assessmentOpen}
              onClose={() => setAssessmentOpen(false)}
              clientName={client.name}
              clientId={client.id}
              useAbsolutePosition
            />
          )}

          {/* Client Session Tools — client only (absolute within container on mobile) */}
          {!isTherapist && (
            <ClientSessionTools
              open={clientToolsOpen}
              onClose={() => setClientToolsOpen(false)}
              therapistName={therapist.name}
              clientId={client.id}
              sessionId={session.id}
              useAbsolutePosition
            />
          )}
        </div>
      </>
    );
  }

  // === DESKTOP LAYOUT ===
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <MobileViewToggle />
      {/* Video Grid */}
      <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 p-2 md:p-4 transition-all duration-300 ${sidebarOpen ? 'md:mr-[420px]' : ''}`}>
        {/* Remote Video (Other Participant) */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video md:aspect-auto min-h-[40vh] md:min-h-0">
          <img
            src={remoteParticipant.avatar}
            alt={remoteParticipant.name}
            className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30"
          />
          {isConnecting ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-sm md:text-base">Connecting...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center text-2xl md:text-4xl mb-3 mx-auto">
                    {remoteParticipant.name.charAt(0)}
                  </div>
                  <p className="font-medium text-base md:text-lg">{remoteParticipant.name}</p>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/50 text-white px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm">
                {remoteParticipant.name}
              </div>
            </>
          )}
        </div>

        {/* Local Video (You) */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video md:aspect-auto">
          <img
            src={localParticipant.avatar}
            alt={localParticipant.name}
            className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30"
          />
          {isVideoOff ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-3 mx-auto">
                  {localParticipant.name.charAt(0)}
                </div>
                <p className="font-medium text-lg">{localParticipant.name} (You)</p>
                <p className="text-sm text-gray-400">Camera off</p>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl mb-3 mx-auto">
                    {localParticipant.name.charAt(0)}
                  </div>
                  <p className="font-medium text-lg">{localParticipant.name} (You)</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                You
              </div>
            </>
          )}
          {isMuted && (
            <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full">
              <MicOff className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Session Info */}
      <div className={`px-2 md:px-4 pb-2 transition-all duration-300 ${sidebarOpen ? 'md:mr-[420px]' : ''}`}>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-2 md:p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="text-xs md:text-sm">
                <span className="text-gray-400">Duration: </span>
                <span className="font-medium">{formatDuration(sessionDuration)}</span>
              </div>
              <div className="text-xs md:text-sm truncate max-w-full">
                <span className="text-gray-400">Room: </span>
                <span className="font-mono text-xs">{session.azureRoomId}</span>
              </div>
            </div>
            <div className="text-xs md:text-sm text-gray-400">
              {session.duration} min session
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className={`p-3 md:p-6 bg-gray-900 transition-all duration-300 ${sidebarOpen ? 'md:mr-[420px]' : ''}`}>
        <div className="max-w-2xl mx-auto flex justify-center items-center gap-2 md:gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
          >
            {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
          </Button>
          
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-14 h-14 md:w-16 md:h-16"
          >
            <PhoneOff className="w-6 h-6 md:w-7 md:h-7" />
          </Button>

          {/* Assessment button — therapist only */}
          {isTherapist && (
            <Button
              variant={assessmentOpen ? "default" : "secondary"}
              size="lg"
              onClick={() => setAssessmentOpen(!assessmentOpen)}
              className={`rounded-full w-12 h-12 md:w-14 md:h-14 ${assessmentOpen ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              title="In-session assessment"
            >
              <ClipboardList className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          )}

          {/* Notes/chat button — client only */}
          {!isTherapist && (
            <Button
              variant={clientToolsOpen ? "default" : "secondary"}
              size="lg"
              onClick={() => setClientToolsOpen(!clientToolsOpen)}
              className={`rounded-full w-12 h-12 md:w-14 md:h-14 ${clientToolsOpen ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              title="Session tools"
            >
              <StickyNote className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            onClick={() => toast.info("Screen sharing coming soon")}
            className="rounded-full w-12 h-12 md:w-14 md:h-14 hidden sm:flex"
          >
            <Monitor className="w-5 h-5 md:w-6 md:h-6" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => toast.info("Settings coming soon")}
            className="rounded-full w-12 h-12 md:w-14 md:h-14 hidden sm:flex"
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>

        {/* Azure Communication Services Integration Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by Azure Communication Services
          </p>
          <p className="text-xs text-gray-600 mt-1 hidden md:block">
            In production, this would use Azure Communication Services SDK for real video/audio streaming
          </p>
        </div>
      </div>

      {/* Assessment Sidebar — therapist only */}
      {isTherapist && (
        <InSessionAssessment
          open={assessmentOpen}
          onClose={() => setAssessmentOpen(false)}
          clientName={client.name}
          clientId={client.id}
        />
      )}

      {/* Client Session Tools — client only */}
      {!isTherapist && (
        <ClientSessionTools
          open={clientToolsOpen}
          onClose={() => setClientToolsOpen(false)}
          therapistName={therapist.name}
          clientId={client.id}
          sessionId={session.id}
        />
      )}
    </div>
  );
}