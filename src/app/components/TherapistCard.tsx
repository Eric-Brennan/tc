import { useNavigate, useLocation } from "react-router";
import { Therapist } from "../data/mockData";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, PoundSterling, Clock, GraduationCap } from "lucide-react";

interface TherapistCardProps {
  therapist: Therapist;
}

export default function TherapistCard({ therapist }: TherapistCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const routePrefix = location.pathname.startsWith('/t') ? '/t' : '/c';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 md:p-6">
        <div className="flex gap-3 md:gap-4">
          <img
            src={therapist.avatar}
            alt={therapist.name}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg truncate">{therapist.name}</h3>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{therapist.credentials}</p>
            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">{therapist.location}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 md:p-6 pt-0 md:pt-0">
        <div>
          <p className="text-xs md:text-sm font-medium mb-2">Specializations:</p>
          <div className="flex flex-wrap gap-1">
            {therapist.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {therapist.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">+{therapist.specializations.length - 3} more</Badge>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs md:text-sm font-medium mb-2">Clinical Approaches:</p>
          <div className="flex flex-wrap gap-1">
            {therapist.clinicalApproaches.slice(0, 2).map((approach) => (
              <Badge key={approach} variant="outline" className="text-xs">
                {approach}
              </Badge>
            ))}
            {therapist.clinicalApproaches.length > 2 && (
              <Badge variant="outline" className="text-xs">+{therapist.clinicalApproaches.length - 2} more</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm pt-2">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
            <span className="whitespace-nowrap">{therapist.yearsOfExperience} years</span>
          </div>
          <div className="flex items-center gap-1">
            <PoundSterling className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
            <span className="whitespace-nowrap">£{therapist.hourlyRate}/hr</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 md:p-6 pt-0 md:pt-0">
        <Button 
          className="w-full"
          onClick={() => navigate(`${routePrefix}/therapist/${therapist.id}`)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}