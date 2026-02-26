import React from "react";
import { mockCurrentTherapist } from "../data/mockData";
import type { ThemeSettings } from "../data/mockData";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Palette, RotateCcw, Video, Users, MessageSquare, Phone, Shield, Save, Moon, Sun, Copy, Presentation } from "lucide-react";
import { toast } from "sonner";
import { useThemeContext } from "../contexts/ThemeContext";
import { getActiveColor } from "../hooks/useTheme";

/** Color key pairs: [lightKey, darkKey] */
type ColorKeyPair = {
  lightKey: keyof ThemeSettings;
  darkKey: keyof ThemeSettings;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const modalityColorPairs: ColorKeyPair[] = [
  {
    lightKey: 'videoColor',
    darkKey: 'darkVideoColor',
    label: 'Video Sessions',
    description: 'Color for video call sessions',
    icon: Video,
  },
  {
    lightKey: 'inPersonColor',
    darkKey: 'darkInPersonColor',
    label: 'In-Person Sessions',
    description: 'Color for face-to-face sessions',
    icon: Users,
  },
  {
    lightKey: 'textColor',
    darkKey: 'darkTextColor',
    label: 'Text Sessions',
    description: 'Color for text-based messaging sessions',
    icon: MessageSquare,
  },
  {
    lightKey: 'phoneCallColor',
    darkKey: 'darkPhoneCallColor',
    label: 'Phone Sessions',
    description: 'Color for phone call sessions',
    icon: Phone,
  },
  {
    lightKey: 'supervisionColor',
    darkKey: 'darkSupervisionColor',
    label: 'Supervision Sessions',
    description: 'Color for supervision sessions and related elements',
    icon: Shield,
  },
  {
    lightKey: 'workshopColor',
    darkKey: 'darkWorkshopColor',
    label: 'Workshops',
    description: 'Color for workshops on the calendar and listings',
    icon: Presentation,
  },
];

const generalColorPairs: ColorKeyPair[] = [
  {
    lightKey: 'primaryColor',
    darkKey: 'darkPrimaryColor',
    label: 'Primary Color',
    description: 'Main brand color used for buttons and highlights',
  },
  {
    lightKey: 'accentColor',
    darkKey: 'darkAccentColor',
    label: 'Accent Color',
    description: 'Secondary color for accents and highlights',
  },
  {
    lightKey: 'successColor',
    darkKey: 'darkSuccessColor',
    label: 'Success Color',
    description: 'Color for success messages and positive actions',
  },
  {
    lightKey: 'warningColor',
    darkKey: 'darkWarningColor',
    label: 'Warning Color',
    description: 'Color for warnings and cautionary messages',
  },
  {
    lightKey: 'errorColor',
    darkKey: 'darkErrorColor',
    label: 'Error Color',
    description: 'Color for errors and destructive actions',
  },
];

function ColorPairRow({
  pair,
  themeSettings,
  onColorChange,
  onCopyLightToDark,
}: {
  pair: ColorKeyPair;
  themeSettings: ThemeSettings;
  onColorChange: (key: keyof ThemeSettings, value: string) => void;
  onCopyLightToDark: (lightKey: keyof ThemeSettings, darkKey: keyof ThemeSettings) => void;
}) {
  const IconComponent = pair.icon;
  const lightValue = themeSettings[pair.lightKey] as string;
  const darkValue = themeSettings[pair.darkKey] as string;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="w-4 h-4 text-muted-foreground" />}
          <Label>{pair.label}</Label>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{pair.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Light mode color */}
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="relative flex-1">
            <Input
              type="text"
              value={lightValue}
              onChange={(e) => onColorChange(pair.lightKey, e.target.value)}
              placeholder="#000000"
              className="font-mono text-sm"
            />
          </div>
          <Input
            type="color"
            value={lightValue}
            onChange={(e) => onColorChange(pair.lightKey, e.target.value)}
            className="w-12 h-9 cursor-pointer p-0.5 shrink-0"
          />
          <div
            className="w-9 h-9 rounded border shrink-0"
            style={{ backgroundColor: lightValue }}
          />
        </div>

        {/* Dark mode color */}
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="relative flex-1">
            <Input
              type="text"
              value={darkValue}
              onChange={(e) => onColorChange(pair.darkKey, e.target.value)}
              placeholder="#000000"
              className="font-mono text-sm"
            />
          </div>
          <Input
            type="color"
            value={darkValue}
            onChange={(e) => onColorChange(pair.darkKey, e.target.value)}
            className="w-12 h-9 cursor-pointer p-0.5 shrink-0"
          />
          <div
            className="w-9 h-9 rounded border shrink-0"
            style={{ backgroundColor: darkValue }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 shrink-0"
            title="Copy light color to dark"
            onClick={() => onCopyLightToDark(pair.lightKey, pair.darkKey)}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { themeSettings, updateColor, resetTheme, saveTheme, dispatch, toggleAndSaveDarkMode, darkModeSupported } = useThemeContext();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Snapshot of saved state to support discard
  const [savedSnapshot, setSavedSnapshot] = React.useState<ThemeSettings>(() => ({ ...themeSettings }));

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    updateColor(key, value);
    setHasChanges(true);
  };

  const handleCopyLightToDark = (lightKey: keyof ThemeSettings, darkKey: keyof ThemeSettings) => {
    const lightValue = themeSettings[lightKey] as string;
    updateColor(darkKey, lightValue);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveTheme();
    setSavedSnapshot({ ...themeSettings });
    toast.success("Theme settings saved successfully");
    setHasChanges(false);
  };

  const handleDiscard = () => {
    // Restore the saved snapshot but preserve current dark mode state
    const restored = { ...savedSnapshot, darkMode: themeSettings.darkMode };
    dispatch({ type: "SET_THEME", payload: restored });
    setHasChanges(false);
  };

  const handleReset = () => {
    resetTheme();
    setHasChanges(true);
  };

  // Get the "active" color for preview based on current dark mode setting
  const previewColor = (lightKey: 'primaryColor' | 'supervisionColor' | 'workshopColor' | 'videoColor' | 'inPersonColor' | 'textColor' | 'phoneCallColor' | 'accentColor' | 'successColor' | 'warningColor' | 'errorColor') => {
    return getActiveColor(lightKey, themeSettings);
  };

  return (
    <Layout
      userType="therapist"
      userName={mockCurrentTherapist.name}
      userAvatar={mockCurrentTherapist.avatar}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Therapy Connect experience
          </p>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList>
            <TabsTrigger value="theme" className="gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6 pb-32">
            {/* Save Button - Fixed at bottom when changes exist */}
            {hasChanges && (
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
                <div className="container mx-auto px-4 py-4 max-w-6xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Unsaved Changes</p>
                      <p className="text-sm text-muted-foreground">You have unsaved theme changes</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleDiscard}
                      >
                        Discard Changes
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        className="gap-2 font-semibold"
                        size="lg"
                      >
                        <Save className="w-4 h-4" />
                        Save Theme
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle */}
            {darkModeSupported ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {themeSettings.darkMode ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                    <CardTitle>Appearance</CardTitle>
                  </div>
                  <CardDescription>
                    Toggle between light and dark mode. Each mode has its own set of colors.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for a more comfortable viewing experience in low-light environments
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={themeSettings.darkMode}
                      onCheckedChange={() => {
                        toggleAndSaveDarkMode();
                        // Update the saved snapshot to reflect dark mode change so discard doesn't revert it
                        setSavedSnapshot(prev => ({ ...prev, darkMode: !themeSettings.darkMode }));
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5" />
                    <CardTitle>Appearance</CardTitle>
                  </div>
                  <CardDescription>
                    Dark mode is not available in this browser due to limited CSS support.
                    For the full experience including dark mode, try Chrome, Firefox, or Edge.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Session Modality Colors */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  <CardTitle>Session Modality Colors</CardTitle>
                </div>
                <CardDescription>
                  Customize the colors for different session types. Set distinct colors for light and dark mode.
                </CardDescription>
                {/* Column headers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Light Mode</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">Dark Mode</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {modalityColorPairs.map((pair) => (
                  <ColorPairRow
                    key={pair.lightKey}
                    pair={pair}
                    themeSettings={themeSettings}
                    onColorChange={handleColorChange}
                    onCopyLightToDark={handleCopyLightToDark}
                  />
                ))}
              </CardContent>
            </Card>

            {/* General Theme Colors */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  <CardTitle>General Theme Colors</CardTitle>
                </div>
                <CardDescription>
                  Customize general interface colors for both light and dark mode
                </CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Light Mode</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">Dark Mode</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {generalColorPairs.map((pair) => (
                  <ColorPairRow
                    key={pair.lightKey}
                    pair={pair}
                    themeSettings={themeSettings}
                    onColorChange={handleColorChange}
                    onCopyLightToDark={handleCopyLightToDark}
                  />
                ))}

                <Separator />

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Theme
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how your color choices look in the current mode ({themeSettings.darkMode ? 'Dark' : 'Light'})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Session Modality Cards Preview */}
                  <div>
                    <p className="text-sm font-medium mb-3">Session Modalities</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          borderColor: previewColor('videoColor'),
                          backgroundColor: `${previewColor('videoColor')}10`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="w-4 h-4" style={{ color: previewColor('videoColor') }} />
                          <p className="font-medium">Video Session</p>
                        </div>
                        <p className="text-sm text-muted-foreground">50 minutes &middot; £80</p>
                      </div>
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          borderColor: previewColor('inPersonColor'),
                          backgroundColor: `${previewColor('inPersonColor')}10`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4" style={{ color: previewColor('inPersonColor') }} />
                          <p className="font-medium">In-Person Session</p>
                        </div>
                        <p className="text-sm text-muted-foreground">50 minutes &middot; £90</p>
                      </div>
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          borderColor: previewColor('textColor'),
                          backgroundColor: `${previewColor('textColor')}10`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4" style={{ color: previewColor('textColor') }} />
                          <p className="font-medium">Text Session</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Async messaging &middot; £60</p>
                      </div>
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          borderColor: previewColor('phoneCallColor'),
                          backgroundColor: `${previewColor('phoneCallColor')}10`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4" style={{ color: previewColor('phoneCallColor') }} />
                          <p className="font-medium">Phone Session</p>
                        </div>
                        <p className="text-sm text-muted-foreground">30 minutes &middot; £50</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Special Sessions */}
                  <div>
                    <p className="text-sm font-medium mb-3">Special Session Types</p>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          borderColor: previewColor('supervisionColor'),
                          backgroundColor: `${previewColor('supervisionColor')}10`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4" style={{ color: previewColor('supervisionColor') }} />
                          <p className="font-medium">Supervision Session</p>
                        </div>
                        <p className="text-sm text-muted-foreground">60 minutes &middot; £120</p>
                      </div>
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          borderColor: previewColor('workshopColor'),
                          backgroundColor: `${previewColor('workshopColor')}10`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Presentation className="w-4 h-4" style={{ color: previewColor('workshopColor') }} />
                          <p className="font-medium">Workshop</p>
                        </div>
                        <p className="text-sm text-muted-foreground">90 minutes &middot; £25 &middot; 12/20 participants</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons Preview */}
                  <div>
                    <p className="text-sm font-medium mb-3">Action Colors</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: previewColor('primaryColor') }}
                      >
                        Primary
                      </button>
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: previewColor('successColor') }}
                      >
                        Success
                      </button>
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: previewColor('warningColor') }}
                      >
                        Warning
                      </button>
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: previewColor('errorColor') }}
                      >
                        Error
                      </button>
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: previewColor('accentColor') }}
                      >
                        Accent
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Account settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Notification settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}