import { useState } from "react";
import { mockCurrentClient, mockTherapists, mockConnections, mockCurrentTherapist } from "../data/mockData";
import TherapistCard from "../components/TherapistCard";
import Layout from "../components/Layout";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { useProfileMode } from "../contexts/ProfileModeContext";

export default function FindTherapists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const { isClientMode } = useProfileMode();

  // The therapist's own ID — used to hide their own profile in client mode
  const ownTherapistId = isClientMode ? mockCurrentTherapist.id : null;

  // Get unique specializations for filter
  const allSpecializations = Array.from(
    new Set(mockTherapists.flatMap(t => t.specializations))
  ).sort();

  // Filter therapists
  const filteredTherapists = mockTherapists.filter(therapist => {
    // Hide the therapist's own profile when browsing as a client
    if (ownTherapistId && therapist.id === ownTherapistId) return false;

    const matchesSearch = 
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      therapist.clinicalApproaches.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialization = 
      specializationFilter === "all" || 
      therapist.specializations.includes(specializationFilter);
    
    return matchesSearch && matchesSpecialization;
  });

  // Get current therapist connection
  const currentConnection = mockConnections.find(
    c => c.clientId === mockCurrentClient.id && c.status === 'accepted'
  );
  const currentTherapist = mockTherapists.find(t => t.id === currentConnection?.therapistId);

  return (
    <Layout
      userType="client"
      userName={mockCurrentClient.name}
      userAvatar={mockCurrentClient.avatar}
    >
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              {currentTherapist ? "Find a New Therapist" : "Find Your Therapist"}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {currentTherapist 
                ? "Browse our network to find a different therapist that fits your needs."
                : "Browse our network of licensed therapists and find the right fit for you."
              }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTherapists.map(therapist => (
                <TherapistCard key={therapist.id} therapist={therapist} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}