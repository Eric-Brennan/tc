import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { Button } from "./ui/button";
import { useProfileMode } from "../contexts/ProfileModeContext";

export default function ClientModeBanner() {
  const { isClientMode, exitClientMode } = useProfileMode();
  const navigate = useNavigate();

  if (!isClientMode) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-3 md:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">
            You're browsing as a <span className="font-medium">client</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 h-7 px-2"
          onClick={() => {
            exitClientMode();
            navigate("/t");
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Therapist Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>
    </div>
  );
}
