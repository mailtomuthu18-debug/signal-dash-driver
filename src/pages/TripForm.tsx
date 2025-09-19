import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Navigation, LogOut } from "lucide-react";

interface TripData {
  startLocation: string;
  destination: string;
}

const TripForm = () => {
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const tripData: TripData = {
      startLocation,
      destination,
    };

    // Store trip data in localStorage for the dashboard
    localStorage.setItem('currentTrip', JSON.stringify(tripData));

    toast({
      title: "Route calculated",
      description: "Traffic signals loaded for your emergency route",
    });

    navigate("/dashboard");
    setIsLoading(false);
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Navigation className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Trip Planning</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Plan Emergency Route</h1>
            <p className="text-muted-foreground">
              Enter your route details to access traffic signal controls
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Information
              </CardTitle>
              <CardDescription>
                Specify the start and destination points for your emergency response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Location</Label>
                  <Input
                    id="start"
                    placeholder="e.g., City Hospital Emergency Department"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Location</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Downtown Medical Center"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "Calculating Route..." : "Start Emergency Route"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-accent rounded-lg">
                <h3 className="font-medium text-accent-foreground mb-2">Quick Examples:</h3>
                <div className="text-sm text-accent-foreground space-y-1">
                  <p>• City Hospital → Downtown Medical Center</p>
                  <p>• Emergency Station 5 → Regional Trauma Center</p>
                  <p>• Ambulance Base → University Hospital</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TripForm;