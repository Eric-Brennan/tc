import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Monitor, Smartphone, Palette, X, Users, RotateCcw } from "lucide-react";
import {
  getTestClientIds,
  getTestClientLabel,
  getTestClientAvatar,
  getCurrentTestClientId,
  switchTestClient,
} from "../data/mockData";
import { resetMockData } from "../data/devPersistence";

const MOBILE_VIEW_KEY = 'therapyconnect-mobile-view';
const PRIMARY_COLOR_KEY = 'therapyconnect-primary-color';

const COLOR_PRESETS = [
  { name: "Default",    color: "#030213", foreground: "#ffffff" },
  { name: "Indigo",     color: "#4f46e5", foreground: "#ffffff" },
  { name: "Blue",       color: "#2563eb", foreground: "#ffffff" },
  { name: "Sky",        color: "#0284c7", foreground: "#ffffff" },
  { name: "Teal",       color: "#0d9488", foreground: "#ffffff" },
  { name: "Emerald",    color: "#059669", foreground: "#ffffff" },
  { name: "Violet",     color: "#7c3aed", foreground: "#ffffff" },
  { name: "Purple",     color: "#9333ea", foreground: "#ffffff" },
  { name: "Fuchsia",    color: "#c026d3", foreground: "#ffffff" },
  { name: "Rose",       color: "#e11d48", foreground: "#ffffff" },
  { name: "Orange",     color: "#ea580c", foreground: "#ffffff" },
  { name: "Amber",      color: "#d97706", foreground: "#ffffff" },
  { name: "Slate",      color: "#475569", foreground: "#ffffff" },
  { name: "Coral",      color: "#f97066", foreground: "#ffffff" },
  { name: "Sage",       color: "#6b8f71", foreground: "#ffffff" },
];

function applyPrimaryColor(color: string, foreground: string) {
  const root = document.documentElement;
  root.style.setProperty('--primary', color);
  root.style.setProperty('--primary-foreground', foreground);
  root.style.setProperty('--sidebar-primary', color);
  root.style.setProperty('--ring', color);
}

export default function MobileViewToggle() {
  const [isMobileView, setIsMobileView] = useState(() => {
    const saved = localStorage.getItem(MOBILE_VIEW_KEY);
    return saved === 'true';
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showClientSwitcher, setShowClientSwitcher] = useState(false);
  const [activeColor, setActiveColor] = useState(() => {
    const saved = localStorage.getItem(PRIMARY_COLOR_KEY);
    return saved || COLOR_PRESETS[0].color;
  });

  // Apply saved color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem(PRIMARY_COLOR_KEY);
    if (savedColor) {
      const preset = COLOR_PRESETS.find(p => p.color === savedColor);
      if (preset) {
        applyPrimaryColor(preset.color, preset.foreground);
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (isMobileView) {
      // Add mobile simulation class
      root.classList.add('mobile-simulation');
      document.body.classList.add('mobile-simulation-body');
      localStorage.setItem(MOBILE_VIEW_KEY, 'true');
    } else {
      // Remove mobile simulation
      root.classList.remove('mobile-simulation');
      document.body.classList.remove('mobile-simulation-body');
      localStorage.setItem(MOBILE_VIEW_KEY, 'false');
    }

    return () => {
      root.classList.remove('mobile-simulation');
      document.body.classList.remove('mobile-simulation-body');
    };
  }, [isMobileView]);

  const handleToggle = () => {
    setIsMobileView(!isMobileView);
  };

  const handleColorChange = (preset: typeof COLOR_PRESETS[number]) => {
    setActiveColor(preset.color);
    applyPrimaryColor(preset.color, preset.foreground);
    localStorage.setItem(PRIMARY_COLOR_KEY, preset.color);
  };

  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setActiveColor(color);
    applyPrimaryColor(color, "#ffffff");
    localStorage.setItem(PRIMARY_COLOR_KEY, color);
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2 items-start">
        {/* Client switcher panel */}
        {showClientSwitcher && (
          <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-xl p-3 mb-1 w-[220px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Test as Client</span>
              <button
                onClick={() => setShowClientSwitcher(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {getTestClientIds().map((cid) => {
                const isActive = cid === getCurrentTestClientId();
                return (
                  <button
                    key={cid}
                    onClick={() => { if (!isActive) switchTestClient(cid); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <img
                      src={getTestClientAvatar(cid)}
                      alt={getTestClientLabel(cid)}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isActive ? 'font-semibold' : ''}`}>
                        {getTestClientLabel(cid)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{cid}</p>
                    </div>
                    {isActive && (
                      <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="pt-2 mt-2 border-t">
              <button
                onClick={() => { resetMockData(); window.location.reload(); }}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Test Data
              </button>
            </div>
          </div>
        )}

        {/* Color picker panel */}
        {showColorPicker && (
          <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-xl p-3 mb-1 w-[220px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Primary Color</span>
              <button
                onClick={() => setShowColorPicker(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleColorChange(preset)}
                  title={preset.name}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    activeColor === preset.color
                      ? "border-foreground ring-1 ring-foreground/20 scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: preset.color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t">
              <label className="text-[11px] text-muted-foreground whitespace-nowrap">Custom:</label>
              <input
                type="color"
                value={activeColor}
                onChange={handleCustomColor}
                className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-[11px] text-muted-foreground font-mono">{activeColor}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {/* Client switcher toggle */}
          <Button
            onClick={() => { setShowClientSwitcher(!showClientSwitcher); setShowColorPicker(false); }}
            variant={showClientSwitcher ? "default" : "secondary"}
            className="rounded-full h-14 w-14 shadow-lg"
            size="icon"
            title="Switch Test Client"
          >
            <Users className="h-6 w-6" />
          </Button>

          {/* Color picker toggle */}
          <Button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowClientSwitcher(false); }}
            variant={showColorPicker ? "default" : "secondary"}
            className="rounded-full h-14 w-14 shadow-lg"
            size="icon"
            title="Change Primary Color"
          >
            <Palette className="h-6 w-6" />
          </Button>

          {/* Mobile/Desktop toggle */}
          <Button
            onClick={handleToggle}
            variant={isMobileView ? "default" : "secondary"}
            className="rounded-full h-14 w-14 shadow-lg"
            size="icon"
            title={`Switch to ${isMobileView ? 'Desktop' : 'Mobile'} View`}
          >
            {isMobileView ? (
              <Monitor className="h-6 w-6" />
            ) : (
              <Smartphone className="h-6 w-6" />
            )}
          </Button>
        </div>
        {isMobileView && (
          <div className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border">
            📱 Mobile Mode
          </div>
        )}
      </div>
      
      {/* Mobile CSS Injection */}
      {isMobileView && (
        <style>{`
          /* Force mobile viewport */
          .mobile-simulation-body {
            max-width: 390px !important;
            margin: 0 auto !important;
            box-shadow: 0 0 60px rgba(0, 0, 0, 0.4) !important;
            background: white !important;
            position: relative !important;
            padding-bottom: 80px !important;
          }
          
          html.mobile-simulation {
            background: #1a1a1a !important;
          }
          
          /* Override ALL Tailwind md: breakpoints to always apply mobile styles */
          .mobile-simulation .md\\:px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .mobile-simulation .md\\:px-6 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .mobile-simulation .md\\:py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .mobile-simulation .md\\:py-6 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .mobile-simulation .md\\:p-6 { padding: 1rem !important; }
          .mobile-simulation .md\\:p-4 { padding: 1rem !important; }
          .mobile-simulation .md\\:gap-8 { gap: 1.5rem !important; }
          .mobile-simulation .md\\:gap-6 { gap: 1.5rem !important; }
          .mobile-simulation .md\\:gap-4 { gap: 1rem !important; }
          .mobile-simulation .md\\:space-y-6 > * + * { margin-top: 1rem !important; }
          .mobile-simulation .md\\:space-y-4 > * + * { margin-top: 1rem !important; }
          
          /* Force mobile flex directions */
          .mobile-simulation .md\\:flex-row { flex-direction: column !important; }
          .mobile-simulation .lg\\:flex-row { flex-direction: column !important; }
          
          /* Force mobile widths */
          .mobile-simulation .md\\:w-auto { width: 100% !important; }
          .mobile-simulation .md\\:w-64 { width: 100% !important; }
          .mobile-simulation .md\\:w-80 { width: 100% !important; }
          .mobile-simulation .lg\\:w-80 { width: 100% !important; }
          .mobile-simulation .lg\\:max-w-2xl { max-width: 100% !important; }
          .mobile-simulation .md\\:max-w-2xl { max-width: 100% !important; }
          
          /* Force mobile text sizes */
          .mobile-simulation .md\\:text-base { font-size: 0.875rem !important; }
          .mobile-simulation .md\\:text-lg { font-size: 1rem !important; }
          .mobile-simulation .md\\:text-xl { font-size: 1.125rem !important; }
          .mobile-simulation .md\\:text-2xl { font-size: 1.25rem !important; }
          .mobile-simulation .md\\:text-3xl { font-size: 1.5rem !important; }
          .mobile-simulation .md\\:text-4xl { font-size: 1.875rem !important; }
          
          /* Force mobile grid layouts */
          .mobile-simulation .md\\:grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
          .mobile-simulation .md\\:grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
          .mobile-simulation .lg\\:grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
          
          /* Force mobile items alignment */
          .mobile-simulation .md\\:items-center { align-items: flex-start !important; }
          
          /* Hide elements that are hidden on mobile */
          .mobile-simulation .md\\:block { display: none !important; }
          .mobile-simulation .lg\\:block { display: none !important; }
          
          /* Show elements that should be visible on mobile */
          .mobile-simulation .md\\:hidden { display: block !important; }
          
          /* Force mobile positioning */
          .mobile-simulation .lg\\:sticky { position: static !important; }
          .mobile-simulation .md\\:sticky { position: static !important; }
          
          /* Mobile margins and paddings */
          .mobile-simulation .md\\:mb-6 { margin-bottom: 1rem !important; }
          .mobile-simulation .md\\:mb-4 { margin-bottom: 1rem !important; }
          .mobile-simulation .md\\:mt-6 { margin-top: 1rem !important; }
          .mobile-simulation .md\\:mt-4 { margin-top: 1rem !important; }
          
          /* Force mobile orders */
          .mobile-simulation .lg\\:order-none { order: 0 !important; }
          .mobile-simulation .md\\:order-none { order: 0 !important; }
          
          /* Force lg:order-* classes to not apply in mobile mode */
          .mobile-simulation .lg\\:order-1 { order: revert !important; }
          .mobile-simulation .lg\\:order-2 { order: revert !important; }
          .mobile-simulation .lg\\:order-3 { order: revert !important; }
          
          /* Mobile aspect ratios */
          .mobile-simulation .md\\:aspect-auto { aspect-ratio: 16/9 !important; }
          
          /* Icon sizes */
          .mobile-simulation .md\\:w-5 { width: 1rem !important; }
          .mobile-simulation .md\\:h-5 { height: 1rem !important; }
          .mobile-simulation .md\\:w-6 { width: 1.25rem !important; }
          .mobile-simulation .md\\:h-6 { height: 1.25rem !important; }
          
          /* Button and control sizes */
          .mobile-simulation .md\\:w-14 { width: 3rem !important; }
          .mobile-simulation .md\\:h-14 { height: 3rem !important; }
          .mobile-simulation .md\\:w-16 { width: 3.5rem !important; }
          .mobile-simulation .md\\:h-16 { height: 3.5rem !important; }
          
          /* Flex shrink */
          .mobile-simulation .lg\\:flex-shrink-0 { flex-shrink: 1 !important; }
          
          /* Min heights */
          .mobile-simulation .md\\:min-h-0 { min-height: 40vh !important; }
          
          /* Navigation display overrides */
          .mobile-simulation .md\\:flex { display: none !important; }
        `}</style>
      )}
    </>
  );
}