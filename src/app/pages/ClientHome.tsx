import { AssessmentReminder } from "../components/AssessmentReminder";
import { JournalReminder } from "../components/JournalReminder";
import { UpcomingSessionBanner } from "../components/UpcomingSessionBanner";
import { useState } from "react";
import { mockTherapists, mockPosts, mockCurrentClient, mockConnections } from "../data/mockData";
import TherapistCard from "../components/TherapistCard";
import PostCard from "../components/PostCard";
import SuggestedTherapistCard from "../components/SuggestedTherapistCard";
import Layout from "../components/Layout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, MessageSquare, User, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";

export default function ClientHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [followedTherapists, setFollowedTherapists] = useState<string[]>(
    mockCurrentClient.followedTherapists || []
  );
  const navigate = useNavigate();

  // Get current therapist connection (primary therapist)
  const currentConnection = mockConnections.find(
    c => c.clientId === mockCurrentClient.id && c.status === 'accepted'
  );
  const hasTherapist = !!currentConnection;
  const primaryTherapist = mockTherapists.find(t => t.id === currentConnection?.therapistId);

  // Get unique specializations for filter
  const allSpecializations = Array.from(
    new Set(mockTherapists.flatMap(t => t.specializations))
  ).sort();

  // Filter therapists for search
  const filteredTherapists = mockTherapists.filter(therapist => {
    const matchesSearch = 
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      therapist.clinicalApproaches.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialization = 
      specializationFilter === "all" || 
      therapist.specializations.includes(specializationFilter);
    
    return matchesSearch && matchesSpecialization;
  });

  // Get suggested therapists based on primary therapist's specializations
  const suggestedTherapists = primaryTherapist
    ? mockTherapists.filter(t => {
        // Don't suggest the primary therapist
        if (t.id === primaryTherapist.id) return false;
        
        // Calculate a match score based on multiple factors
        let matchScore = 0;
        
        // 1. Match with client's areas of concern
        if (mockCurrentClient.areasOfFocus) {
          const clientFocusMatches = t.specializations.filter(spec =>
            mockCurrentClient.areasOfFocus!.some(focus => 
              spec.toLowerCase().includes(focus.toLowerCase()) || 
              focus.toLowerCase().includes(spec.toLowerCase())
            )
          ).length;
          matchScore += clientFocusMatches * 3; // Weight client focus heavily
        }
        
        // 2. Match with primary therapist's specializations
        const specializationMatches = t.specializations.filter(spec => 
          primaryTherapist.specializations.includes(spec)
        ).length;
        matchScore += specializationMatches * 2;
        
        // 3. Match with primary therapist's clinical approaches
        const approachMatches = t.clinicalApproaches.filter(approach => 
          primaryTherapist.clinicalApproaches.includes(approach)
        ).length;
        matchScore += approachMatches;
        
        return matchScore > 0;
      })
      .sort((a, b) => {
        // Sort by match score (calculate again for sorting)
        const getScore = (t: typeof a) => {
          let score = 0;
          if (mockCurrentClient.areasOfFocus) {
            score += t.specializations.filter(spec =>
              mockCurrentClient.areasOfFocus!.some(focus => 
                spec.toLowerCase().includes(focus.toLowerCase()) || 
                focus.toLowerCase().includes(spec.toLowerCase())
              )
            ).length * 3;
          }
          score += t.specializations.filter(spec => 
            primaryTherapist.specializations.includes(spec)
          ).length * 2;
          score += t.clinicalApproaches.filter(approach => 
            primaryTherapist.clinicalApproaches.includes(approach)
          ).length;
          return score;
        };
        return getScore(b) - getScore(a);
      })
      .slice(0, 3)
    : [];

  // Get posts from primary therapist and followed therapists
  const relevantTherapistIds = [
    ...(primaryTherapist ? [primaryTherapist.id] : []),
    ...followedTherapists
  ];
  
  const relevantPosts = mockPosts
    .filter(post => relevantTherapistIds.includes(post.therapistId))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleToggleFollow = (therapistId: string, isFollowing: boolean) => {
    if (isFollowing) {
      setFollowedTherapists([...followedTherapists, therapistId]);
    } else {
      setFollowedTherapists(followedTherapists.filter(id => id !== therapistId));
    }
  };

  return (
    <Layout 
      userType="client" 
      userName={mockCurrentClient.name} 
      userAvatar={mockCurrentClient.avatar}
    >
      <div className="container mx-auto px-4 py-4 md:py-8">
        {hasTherapist ? (
          // Feed Layout with Suggested Therapists
          <div className="flex flex-col lg:flex-row gap-6 lg:justify-center">
            {/* Reminders - Top on mobile (order-0), Right sidebar on desktop */}
            <div className="order-0 lg:order-2 w-full lg:w-80 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Assessment Reminder */}
                <AssessmentReminder clientId={mockCurrentClient.id} />
                
                {/* Journal Reminder */}
                <JournalReminder clientId={mockCurrentClient.id} />
                
                {/* Suggested Therapists Section - Hidden on mobile, shown on desktop */}
                <div className="hidden lg:block">
                  <div>
                    <h3 className="font-semibold mb-3">Suggested for You</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on your areas of concern and your therapist's expertise
                    </p>
                  </div>

                  {suggestedTherapists.length > 0 ? (
                    <div className="space-y-3">
                      {suggestedTherapists.map(therapist => (
                        <SuggestedTherapistCard
                          key={therapist.id}
                          therapist={therapist}
                          isFollowing={followedTherapists.includes(therapist.id)}
                          onToggleFollow={handleToggleFollow}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                      No suggestions available at the moment.
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate('/find-therapists')}
                  >
                    Find More Therapists
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Feed - Center - Order 1 on mobile, order 1 on desktop */}
            <div className="order-1 flex-1 lg:max-w-2xl">
              {/* Upcoming session banner */}
              <UpcomingSessionBanner clientId={mockCurrentClient.id} />

              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-2">Your Feed</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Insights and resources from your therapists
                </p>
              </div>

              {relevantPosts.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    No posts yet. Follow more therapists to see their insights here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relevantPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      currentUserId={mockCurrentClient.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Therapists - Bottom on mobile (order-2), Hidden on desktop */}
            <div className="order-2 lg:hidden w-full">
              <div>
                <h3 className="font-semibold mb-3">Suggested for You</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on your areas of concern and your therapist's expertise
                </p>
              </div>

              {suggestedTherapists.length > 0 ? (
                <div className="space-y-3">
                  {suggestedTherapists.map(therapist => (
                    <SuggestedTherapistCard
                      key={therapist.id}
                      therapist={therapist}
                      isFollowing={followedTherapists.includes(therapist.id)}
                      onToggleFollow={handleToggleFollow}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                  No suggestions available at the moment.
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/find-therapists')}
              >
                Find More Therapists
              </Button>
            </div>
          </div>
        ) : (
          // Search Interface for clients without a therapist
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Find Your Therapist</h2>
              <p className="text-muted-foreground">
                Browse our network of licensed therapists and find the right fit for you.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialization, or approach..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filter by specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {allSpecializations.map(spec => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTherapists.map(therapist => (
                  <TherapistCard key={therapist.id} therapist={therapist} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}