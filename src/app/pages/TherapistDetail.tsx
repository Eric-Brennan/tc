import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { mockTherapists, mockPosts, mockCurrentClient, mockClientCourseBookings, mockConnections, mockProBonoTokens } from "../data/mockData";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import BookingModal from "../components/BookingModal";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { 
  MapPin, 
  GraduationCap, 
  Calendar,
  Heart,
  HeartOff,
  Shield,
  Package,
  Clock,
  MessageSquare,
  Send,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { persistMockData } from "../data/devPersistence";
import { governingBodyLabels, membershipLevelLabels } from "../../utils/enumLabels";

export default function TherapistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(
    mockCurrentClient.followedTherapists?.includes(id || "") || false
  );

  const therapist = mockTherapists.find(t => t.id === id);

  // Connection status between current client and this therapist
  const connection = mockConnections.find(
    c => c.clientId === mockCurrentClient.id && c.therapistId === id
  );
  const connectionStatus = connection?.status; // undefined | 'pending' | 'accepted' | 'rejected'
  const isConnected = connectionStatus === 'accepted';
  const isPending = connectionStatus === 'pending';

  // Local state for optimistic "Send Message" → pending transition
  const [justRequested, setJustRequested] = useState(false);
  const showPending = isPending || justRequested;
  
  if (!therapist) {
    return (
      <Layout
        userType="client"
        userName={mockCurrentClient.name}
        userAvatar={mockCurrentClient.avatar}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Therapist not found</h2>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Get posts from this therapist
  const therapistPosts = mockPosts
    .filter(post => post.therapistId === therapist.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`Now following ${therapist.name}`);
    } else {
      toast.success(`Unfollowed ${therapist.name}`);
    }
  };

  const handleSendConnectionRequest = () => {
    // In a real app this would create a connection request + initial message via API
    setJustRequested(true);
    // Also add to mockConnections so Messages page can pick it up
    mockConnections.push({
      id: `conn-${Date.now()}`,
      clientId: mockCurrentClient.id,
      therapistId: therapist.id,
      status: 'pending',
      message: `Hi ${therapist.name}, I'd like to connect with you about therapy.`,
      createdAt: new Date()
    });
    persistMockData(); // DEV-ONLY
    toast.success(`Connection request sent to ${therapist.name}`);
    // Navigate to messages with this therapist
    navigate(`/messages/${therapist.id}`);
  };

  return (
    <Layout
      userType="client"
      userName={mockCurrentClient.name}
      userAvatar={mockCurrentClient.avatar}
    >
      <div className="bg-background pb-8">
        {/* Banner and Profile Header */}
        <div className="relative">
          {/* Banner Image */}
          <div className="w-full h-48 md:h-64 lg:h-80 bg-muted overflow-hidden">
            {therapist.bannerImage ? (
              <img
                src={therapist.bannerImage}
                alt={`${therapist.name} banner`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
            )}
          </div>

          {/* Profile Info Container */}
          <div className="container mx-auto px-4">
            <div className="relative">
              {/* Profile Picture - Overlapping Banner */}
              <div className="absolute -top-12 md:-top-20 left-0">
                <img
                  src={therapist.avatar}
                  alt={therapist.name}
                  className="w-24 h-24 md:w-40 md:h-40 rounded-full border-4 border-background object-cover bg-background"
                />
              </div>

              {/* Action Buttons - Top Right */}
              <div className="pt-3 md:pt-4 flex justify-end gap-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  className="gap-2"
                  size="sm"
                >
                  {isFollowing ? (
                    <>
                      <HeartOff className="w-4 h-4" />
                      <span className="hidden sm:inline">Following</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span className="hidden sm:inline">Follow</span>
                    </>
                  )}
                </Button>

                {/* Connection-gated action buttons */}
                {isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate(`/messages/${therapist.id}`)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Message</span>
                    </Button>
                    <Button onClick={() => setIsBookingOpen(true)} size="sm" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Book Session</span>
                      <span className="sm:hidden">Book</span>
                    </Button>
                  </>
                ) : showPending ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate(`/messages/${therapist.id}`)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Message</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" disabled>
                      <Loader2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Request Pending</span>
                      <span className="sm:hidden">Pending</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={handleSendConnectionRequest}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send Message</span>
                    <span className="sm:hidden">Connect</span>
                  </Button>
                )}
              </div>

              {/* Connection status banner */}
              {/* Removed — the action buttons already communicate connection state */}

              {/* Name and Credentials */}
              <div className="pt-14 md:pt-6 pl-0 md:pl-44">
                <h1 className="text-2xl md:text-3xl font-bold">{therapist.name}</h1>
                <p className="text-base md:text-lg text-muted-foreground">{therapist.credentials}</p>
                
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 md:mt-3 text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span>{therapist.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span>{therapist.yearsOfExperience} years experience</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs/Info Section */}
            <div className="border-t mt-4">
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - About */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {therapist.bio}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specializations.map(spec => (
                      <Badge key={spec} variant="default">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Clinical Approaches</h3>
                  <div className="flex flex-wrap gap-2">
                    {therapist.clinicalApproaches.map(approach => (
                      <Badge key={approach} variant="secondary">
                        {approach}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Education</h3>
                  <ul className="space-y-2">
                    {therapist.education.map((edu, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {therapist.governingBodyMemberships && therapist.governingBodyMemberships.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Professional Memberships</h3>
                    <ul className="space-y-3">
                      {therapist.governingBodyMemberships.map((mem) => (
                        <li key={mem.id} className="flex items-start gap-2 text-sm">
                          <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-foreground">{governingBodyLabels[mem.governingBody]}</p>
                            <p className="text-muted-foreground">
                              {membershipLevelLabels[mem.membershipLevel]} · {mem.membershipNumber}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {therapist.sessionRates && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Session Rates</h3>
                    <div className="space-y-2 text-sm">
                      {Array.isArray(therapist.sessionRates) ? (
                        therapist.sessionRates.map((rate) => (
                          <div key={rate.id} className="flex justify-between">
                            <span className="text-muted-foreground">{rate.title}</span>
                            <span className="font-medium">£{rate.price}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Contact for pricing</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Packages */}
              {therapist.coursePackages && therapist.coursePackages.filter(cp => cp.isActive).length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Course Packages
                    </h3>
                    <div className="space-y-4">
                      {therapist.coursePackages.filter(cp => cp.isActive).map((cp) => {
                        const sessionRate = (therapist.sessionRates as any[])?.find((r: any) => r.id === cp.sessionRateId);
                        const perSession = cp.totalSessions > 0 ? Math.round(cp.totalPrice / cp.totalSessions) : 0;
                        const standardTotal = sessionRate ? sessionRate.price * cp.totalSessions : 0;
                        const saving = standardTotal - cp.totalPrice;
                        // Check if client has an active booking for this course
                        const existingBooking = mockClientCourseBookings.find(
                          b => b.coursePackageId === cp.id && b.clientId === mockCurrentClient.id && b.status === 'active'
                        );
                        return (
                          <div key={cp.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{cp.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{cp.description}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {cp.totalSessions} sessions
                              </span>
                              {sessionRate && (
                                <span>{sessionRate.title} ({sessionRate.duration} min each)</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-1.5 border-t">
                              <div className="space-y-0.5">
                                <p className="font-medium text-sm">£{cp.totalPrice}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  ~£{perSession}/session
                                  {saving > 0 && (
                                    <span className="text-emerald-600 ml-1">(save £{saving})</span>
                                  )}
                                </p>
                              </div>
                              {existingBooking ? (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Package className="w-3 h-3" />
                                  {existingBooking.sessionsUsed}/{existingBooking.totalSessions} used
                                </Badge>
                              ) : isConnected ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-xs"
                                  onClick={() => {
                                    toast.success(`Course "${cp.title}" purchased! You can now book sessions without payment.`);
                                  }}
                                >
                                  <Package className="w-3 h-3" />
                                  Purchase
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  Connect to purchase
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Feed - Posts */}
            <div className="lg:col-span-2 space-y-4">
              {therapistPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No posts yet from this therapist.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                therapistPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUserId={mockCurrentClient.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal - only rendered when connected */}
      {isConnected && (
        <BookingModal
          therapist={therapist}
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
          clientCourseBookings={mockClientCourseBookings.filter(
            b => b.clientId === mockCurrentClient.id && b.therapistId === therapist.id
          )}
          proBonoTokens={mockProBonoTokens.filter(
            t => t.clientId === mockCurrentClient.id && t.therapistId === therapist.id && t.status === 'available'
          )}
        />
      )}
    </Layout>
  );
}