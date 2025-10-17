import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your BehaviorTracker preferences</p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Storage</CardTitle>
              <CardDescription className="mt-1">Your data is stored locally on this device</CardDescription>
            </div>
            <Badge variant="secondary">Local-First</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              All behavioral data is stored securely on your device using IndexedDB. No data is sent to external servers.
            </p>
          </div>
          <div className="pt-2">
            <h4 className="font-medium text-sm mb-2">Coming Soon:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Cloud backup and sync</li>
              <li>Export data to CSV/PDF</li>
              <li>Theme customization</li>
              <li>Notification preferences</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

