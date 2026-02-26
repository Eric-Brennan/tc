import { useState } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { User, X, MessageSquare, ChevronRight, Clock } from "lucide-react";
import { mockCurrentClient, mockConnections, mockTherapists } from "../data/mockData";

// Common areas of concern for clients
const COMMON_AREAS_OF_CONCERN = [
  'Anxiety',
  'Depression',
  'Trauma',
  'PTSD',
  'Relationship Issues',
  'Family Therapy',
  'Life Transitions',
  'Stress Management',
  'OCD',
  'Eating Disorders',
  'Body Image',
  'Self-Esteem',
  'Substance Abuse',
  'Grief and Loss',
  'Career Counseling',
  'Work Stress',
  'Anger Management',
  'Sleep Issues',
  'Chronic Pain',
  'Bipolar Disorder'
].sort();

export default function ClientProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState(mockCurrentClient.name);
  const [email, setEmail] = useState(mockCurrentClient.email);
  const [location, setLocation] = useState(mockCurrentClient.location || "");
  const [selectedAreas, setSelectedAreas] = useState<string[]>(mockCurrentClient.areasOfFocus || []);
  const [areasOfFocusDetails, setAreasOfFocusDetails] = useState(mockCurrentClient.areasOfFocusDetails || "");
  const [customArea, setCustomArea] = useState("");

  // Get all accepted therapist connections
  const currentConnections = mockConnections.filter(
    c => c.clientId === mockCurrentClient.id && c.status === 'accepted'
  );
  const connectedTherapists = currentConnections
    .map(conn => mockTherapists.find(t => t.id === conn.therapistId))
    .filter(Boolean) as typeof mockTherapists;

  // Get pending therapist connections
  const pendingConnectionsList = mockConnections.filter(
    c => c.clientId === mockCurrentClient.id && c.status === 'pending'
  );
  const pendingTherapists = pendingConnectionsList
    .map(conn => mockTherapists.find(t => t.id === conn.therapistId))
    .filter(Boolean) as typeof mockTherapists;

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving profile:", { name, email, location, selectedAreas, areasOfFocusDetails });
    alert("Profile updated successfully!");
  };

  const handleAddCustomArea = () => {
    if (customArea.trim()) {
      setSelectedAreas([...selectedAreas, customArea.trim()]);
      setCustomArea("");
    }
  };

  const handleRemoveArea = (area: string) => {
    setSelectedAreas(selectedAreas.filter(a => a !== area));
  };

  return (
    <Layout
      userType="client"
      userName={mockCurrentClient.name}
      userAvatar={mockCurrentClient.avatar}
    >
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
            <CardDescription className="text-sm">
              Update your profile details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-4 md:p-6">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={mockCurrentClient.avatar}
                  alt={mockCurrentClient.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Areas of Concern</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the areas you'd like to work on
                  </p>
                </div>
                
                {/* Selected Areas Display */}
                {selectedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAreas.map(area => (
                      <Badge key={area} variant="secondary" className="gap-1">
                        {area}
                        <button
                          onClick={() => handleRemoveArea(area)}
                          className="ml-1 hover:bg-muted rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Common Areas Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-muted/30 rounded-lg">
                  {COMMON_AREAS_OF_CONCERN.map(area => {
                    const isChecked = selectedAreas.includes(area);
                    return (
                      <label
                        key={area}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                      >
                        <span className="relative inline-flex items-center justify-center shrink-0 w-4 h-4">
                          <input
                            type="checkbox"
                            value={area}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAreas([...selectedAreas, area]);
                              } else {
                                handleRemoveArea(area);
                              }
                            }}
                            className="peer sr-only"
                          />
                          <span
                            className={`w-4 h-4 rounded border-2 transition-colors ${
                              isChecked
                                ? 'bg-primary border-primary'
                                : 'bg-white border-gray-400'
                            }`}
                          />
                          {isChecked && (
                            <svg
                              className="absolute pointer-events-none"
                              style={{ width: '10px', height: '10px' }}
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm">{area}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Area Input */}
                <div className="flex gap-2">
                  <Input
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomArea();
                      }
                    }}
                    placeholder="Add a custom area of concern"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddCustomArea}
                  >
                    Add
                  </Button>
                </div>

                {/* Details Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="areasDetails">Additional Details</Label>
                  <Textarea
                    id="areasDetails"
                    value={areasOfFocusDetails}
                    onChange={(e) => setAreasOfFocusDetails(e.target.value)}
                    placeholder="Share more about what you're experiencing and what you hope to achieve in therapy..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps your therapist better understand your needs and goals
                  </p>
                </div>
              </div>

              {connectedTherapists.length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      My Connections
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {connectedTherapists.length} active connection{connectedTherapists.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {connectedTherapists.map((therapist) => (
                      <div
                        key={therapist.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2.5 rounded-lg transition-colors group"
                        onClick={() => navigate(`/c/therapist/${therapist.id}`)}
                      >
                        <img
                          src={therapist.avatar}
                          alt={therapist.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-background"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{therapist.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {therapist.credentials}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/c/messages');
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {pendingTherapists.length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Pending Connections
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {pendingTherapists.length} pending connection{pendingTherapists.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {pendingTherapists.map((therapist) => (
                      <div
                        key={therapist.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2.5 rounded-lg transition-colors group"
                        onClick={() => navigate(`/c/therapist/${therapist.id}`)}
                      >
                        <img
                          src={therapist.avatar}
                          alt={therapist.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-background"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{therapist.name}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 text-amber-600 border-amber-300 shrink-0">
                              <Clock className="w-2.5 h-2.5" />
                              Pending
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {therapist.credentials}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/c/messages');
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/c/find-therapists')}
              >
                {connectedTherapists.length > 0 ? 'Find Another Therapist' : 'Find a Therapist'}
              </Button>

              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}