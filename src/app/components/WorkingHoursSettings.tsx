import React from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Clock, Plus, Trash2, Video, User, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { mockCurrentTherapist } from "../data/mockData";

type SessionModality = "video" | "inPerson" | "text" | "phoneCall";

interface TimeSlot {
  start: string;
  end: string;
  sessionRateIds: string[];
}

interface WorkingDay {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

const defaultWorkingHours: WorkingHours = {
  monday: { enabled: true, slots: [{ start: "09:00", end: "17:00", sessionRateIds: [] }] },
  tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00", sessionRateIds: [] }] },
  wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00", sessionRateIds: [] }] },
  thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00", sessionRateIds: [] }] },
  friday: { enabled: true, slots: [{ start: "09:00", end: "17:00", sessionRateIds: [] }] },
  saturday: { enabled: false, slots: [{ start: "09:00", end: "17:00", sessionRateIds: [] }] },
  sunday: { enabled: false, slots: [{ start: "09:00", end: "17:00", sessionRateIds: [] }] }
};

interface WorkingHoursSettingsProps {
  trigger?: React.ReactNode;
}

const modalityIcons: Record<SessionModality, React.ReactNode> = {
  video: <Video className="w-3 h-3" />,
  inPerson: <User className="w-3 h-3" />,
  text: <MessageSquare className="w-3 h-3" />,
  phoneCall: <Phone className="w-3 h-3" />
};

export default function WorkingHoursSettings({ trigger }: WorkingHoursSettingsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [workingHours, setWorkingHours] = React.useState<WorkingHours>(defaultWorkingHours);

  const sessionRates = mockCurrentTherapist.sessionRates || [];

  const handleToggleDay = (day: keyof WorkingHours) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleTimeChange = (day: keyof WorkingHours, slotIndex: number, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, idx) => 
          idx === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const handleAddTimeSlot = (day: keyof WorkingHours) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "09:00", end: "17:00", sessionRateIds: [] }]
      }
    }));
  };

  const handleRemoveTimeSlot = (day: keyof WorkingHours, slotIndex: number) => {
    if (workingHours[day].slots.length === 1) {
      toast.error("You must have at least one time slot when the day is enabled");
      return;
    }
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, idx) => idx !== slotIndex)
      }
    }));
  };

  const handleToggleSessionRate = (day: keyof WorkingHours, slotIndex: number, sessionRateId: string) => {
    setWorkingHours(prev => {
      const currentSlot = prev[day].slots[slotIndex];
      const hasRate = currentSlot.sessionRateIds.includes(sessionRateId);

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: prev[day].slots.map((slot, idx) => {
            if (idx === slotIndex) {
              return {
                ...slot,
                sessionRateIds: hasRate
                  ? slot.sessionRateIds.filter(id => id !== sessionRateId)
                  : [...slot.sessionRateIds, sessionRateId]
              };
            }
            return slot;
          })
        }
      };
    });
  };

  const handleSave = () => {
    toast.success("Working hours updated successfully!");
    setIsOpen(false);
  };

  const dayLabels: Record<keyof WorkingHours, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            Set Working Hours
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Working Hours & Session Availability</DialogTitle>
          <DialogDescription>
            Configure your availability and which session types are available for each time block.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {(Object.keys(workingHours) as Array<keyof WorkingHours>).map(day => (
            <div key={day} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={workingHours[day].enabled}
                    onCheckedChange={() => handleToggleDay(day)}
                  />
                  <Label className="font-medium capitalize">{dayLabels[day]}</Label>
                </div>
                
                {workingHours[day].enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTimeSlot(day)}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Time Block
                  </Button>
                )}
              </div>
              
              {workingHours[day].enabled && (
                <div className="space-y-3 pl-9">
                  {workingHours[day].slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="border rounded-md p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => handleTimeChange(day, slotIndex, 'start', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => handleTimeChange(day, slotIndex, 'end', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        {workingHours[day].slots.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTimeSlot(day, slotIndex)}
                            className="ml-auto text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Available Session Types:</Label>
                        <div className="flex flex-wrap gap-2">
                          {sessionRates.length > 0 ? (
                            sessionRates.map(rate => (
                              <button
                                key={rate.id}
                                onClick={() => handleToggleSessionRate(day, slotIndex, rate.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                                  slot.sessionRateIds.includes(rate.id)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                              >
                                {modalityIcons[rate.modality]}
                                <span>{rate.title}</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                  £{rate.price}
                                </Badge>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              No session rates configured. Add session rates in your profile settings first.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}