import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Eye, EyeOff } from 'lucide-react';

interface Signal {
  id: string;
  name: string;
  status: "red" | "yellow" | "green";
  location: string;
  lat?: number;
  lng?: number;
}

interface GoogleMapProps {
  signals: Signal[];
  startLocation: string;
  destination: string;
}

const GoogleMap = ({ signals, startLocation, destination }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showApiInput, setShowApiInput] = useState(true);

  // Dummy coordinates for signals (in a real app, these would come from geocoding)
  const signalCoordinates = [
    { lat: 40.7580, lng: -73.9855 }, // Signal 1 - Times Square area
    { lat: 40.7505, lng: -73.9934 }, // Signal 2 - Near Herald Square
    { lat: 40.7614, lng: -73.9776 }, // Signal 3 - Near Central Park
    { lat: 40.7489, lng: -73.9680 }, // Signal 4 - East Side
    { lat: 40.7549, lng: -73.9840 }, // Signal 5 - Midtown
  ];

  const loadMap = async () => {
    if (!apiKey || !mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      await loader.load();
      
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7580, lng: -73.9855 }, // NYC center
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      mapInstanceRef.current = map;
      
      // Add signal markers
      addSignalMarkers(map);
      
      // Add route markers
      addRouteMarkers(map);
      
      setMapLoaded(true);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  const addSignalMarkers = (map: google.maps.Map) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    signals.forEach((signal, index) => {
      const coords = signalCoordinates[index % signalCoordinates.length];
      
      const color = signal.status === 'green' ? '#22c55e' : 
                   signal.status === 'yellow' ? '#eab308' : '#ef4444';
      
      const marker = new google.maps.Marker({
        position: coords,
        map: map,
        title: signal.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-medium">${signal.name}</h3>
            <p class="text-sm text-gray-600">${signal.location}</p>
            <p class="text-sm">Status: <span class="font-medium" style="color: ${color}">${signal.status.toUpperCase()}</span></p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const addRouteMarkers = (map: google.maps.Map) => {
    // Start location marker (green)
    const startMarker = new google.maps.Marker({
      position: { lat: 40.7505, lng: -73.9934 },
      map: map,
      title: `Start: ${startLocation}`,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 6,
      }
    });

    // Destination marker (red)
    const destMarker = new google.maps.Marker({
      position: { lat: 40.7614, lng: -73.9776 },
      map: map,
      title: `Destination: ${destination}`,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: '#dc2626',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 6,
      }
    });

    markersRef.current.push(startMarker, destMarker);
  };

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      addSignalMarkers(mapInstanceRef.current);
    }
  }, [signals, mapLoaded]);

  const handleLoadMap = () => {
    if (apiKey.trim()) {
      setShowApiInput(false);
      loadMap();
    }
  };

  if (showApiInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Map
          </CardTitle>
          <CardDescription>
            Enter your Google Maps API key to view the route and traffic signals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Google Maps API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Google Maps API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>
          <Button onClick={handleLoadMap} disabled={!apiKey.trim()}>
            Load Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Map
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowApiInput(true)}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Change API Key
          </Button>
        </CardTitle>
        <CardDescription>
          Interactive map showing your route and traffic signal locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Green Signal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Yellow Signal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span>Red Signal</span>
            </div>
          </div>
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: '400px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMap;