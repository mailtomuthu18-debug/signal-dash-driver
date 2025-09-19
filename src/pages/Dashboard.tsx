import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Navigation, CheckCircle, AlertTriangle } from "lucide-react";
import GoogleMap from "@/components/GoogleMap";

interface Signal {
  id: string;
  name: string;
  status: "red" | "yellow" | "green";
  location: string;
}

interface TripData {
  startLocation: string;
  destination: string;
}

const Dashboard = () => {
  const [signals, setSignals] = useState<Signal[]>([
    { id: "1", name: "Signal 1 - Main & First", status: "red", location: "Main St & First Ave" },
    { id: "2", name: "Signal 2 - Central Plaza", status: "yellow", location: "Central Plaza Intersection" },
    { id: "3", name: "Signal 3 - Hospital Rd", status: "green", location: "Hospital Rd & Medical Blvd" },
    { id: "4", name: "Signal 4 - Downtown Core", status: "red", location: "Downtown Core Junction" },
    { id: "5", name: "Signal 5 - Emergency Route", status: "yellow", location: "Emergency Route Access" },
  ]);

  const [tripData, setTripData] = useState<TripData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedTrip = localStorage.getItem('currentTrip');
    if (storedTrip) {
      setTripData(JSON.parse(storedTrip));
    } else {
      navigate("/trip-form");
    }
  }, [navigate]);

  const changeSignalToGreen = (signalId: string) => {
    setSignals(prev => 
      prev.map(signal => 
        signal.id === signalId 
          ? { ...signal, status: "green" as const }
          : signal
      )
    );
    
    const signal = signals.find(s => s.id === signalId);
    toast({
      title: "Signal Override Activated",
      description: `${signal?.name} changed to GREEN`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green": return "bg-success text-success-foreground";
      case "yellow": return "bg-warning text-warning-foreground";
      case "red": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "green": return <CheckCircle className="h-4 w-4" />;
      case "yellow": return <AlertTriangle className="h-4 w-4" />;
      case "red": return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const goBack = () => {
    navigate("/trip-form");
  };

  const greenSignals = signals.filter(s => s.status === "green").length;
  const totalSignals = signals.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Navigation className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Signal Control Dashboard</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            Emergency Active
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {tripData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">From</p>
                  <p className="font-medium">{tripData.startLocation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">To</p>
                  <p className="font-medium">{tripData.destination}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GoogleMap 
              signals={signals}
              startLocation={tripData?.startLocation || ""}
              destination={tripData?.destination || ""}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Traffic Signal Control</CardTitle>
                <CardDescription>
                  Override traffic signals along your emergency route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signals.map((signal) => (
                    <div key={signal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{signal.name}</h3>
                          <Badge 
                            className={`${getStatusColor(signal.status)} flex items-center gap-1`}
                          >
                            {getStatusIcon(signal.status)}
                            {signal.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{signal.location}</p>
                      </div>
                      <div className="ml-4">
                        {signal.status !== "green" ? (
                          <Button 
                            onClick={() => changeSignalToGreen(signal.id)}
                            variant="default"
                            size="sm"
                          >
                            Override to Green
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Already Green
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{greenSignals}</div>
                    <div className="text-sm text-muted-foreground">of {totalSignals} signals green</div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(greenSignals / totalSignals) * 100}%` }}
                    ></div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {greenSignals === totalSignals 
                        ? "All signals cleared for emergency passage"
                        : `${totalSignals - greenSignals} signals need override`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setSignals(prev => prev.map(s => ({ ...s, status: "green" as const })));
                    toast({
                      title: "All Signals Override",
                      description: "All traffic signals set to GREEN",
                    });
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Override All Signals
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/trip-form");
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Plan New Route
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;