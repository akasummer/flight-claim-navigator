
import React, { useCallback } from "react";
import { useForm } from "@/context/FormContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { airports, flightNumbers } from "@/data/mockData";
import { Airport } from "@/types";

const FlightInfoForm: React.FC = () => {
  const { 
    formData,
    goToNextStep,
    updateFlightField,
    setHasConnectingFlights,
    addFlight,
    removeFlight,
  } = useForm();
  
  const validateForm = useCallback(() => {
    for (const flight of formData.flights) {
      if (!flight.departureAirport || !flight.arrivalAirport || !flight.departureDate || !flight.flightNumber) {
        return false;
      }
    }
    return true;
  }, [formData.flights]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      goToNextStep();
    }
  };

  const handleAddTransitAirport = (flightId: string) => {
    const flight = formData.flights.find((f) => f.id === flightId);
    if (!flight) return;
    
    updateFlightField(flightId, "transitAirports", [...flight.transitAirports, null]);
  };

  const handleRemoveTransitAirport = (flightId: string, index: number) => {
    const flight = formData.flights.find((f) => f.id === flightId);
    if (!flight) return;
    
    const updatedTransits = [...flight.transitAirports];
    updatedTransits.splice(index, 1);
    
    updateFlightField(flightId, "transitAirports", updatedTransits);
  };

  const handleUpdateTransitAirport = (flightId: string, index: number, airport: Airport) => {
    const flight = formData.flights.find((f) => f.id === flightId);
    if (!flight) return;
    
    const updatedTransits = [...flight.transitAirports];
    updatedTransits[index] = airport;
    
    updateFlightField(flightId, "transitAirports", updatedTransits);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Flight Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label className="text-base font-medium mb-2 block">Did you have connecting flights?</Label>
          <RadioGroup
            value={formData.hasConnectingFlights ? "yes" : "no"}
            onValueChange={(value) => setHasConnectingFlights(value === "yes")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="connecting-yes" />
              <Label htmlFor="connecting-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="connecting-no" />
              <Label htmlFor="connecting-no">No</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-8">
          {formData.flights.map((flight, flightIndex) => (
            <div 
              key={flight.id} 
              className="border border-gray-200 rounded-lg p-4 relative bg-gray-50"
            >
              {flightIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeFlight(flight.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              <h3 className="font-medium mb-4">Flight {flightIndex + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor={`departure-${flight.id}`}>Departure Airport</Label>
                  <Select
                    value={flight.departureAirport?.id || ""}
                    onValueChange={(value) => {
                      const airport = airports.find((a) => a.id === value) || null;
                      updateFlightField(flight.id, "departureAirport", airport);
                    }}
                  >
                    <SelectTrigger id={`departure-${flight.id}`}>
                      <SelectValue placeholder="Select departure airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((airport) => (
                        <SelectItem key={airport.id} value={airport.id}>
                          {airport.code} - {airport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`arrival-${flight.id}`}>Arrival Airport</Label>
                  <Select
                    value={flight.arrivalAirport?.id || ""}
                    onValueChange={(value) => {
                      const airport = airports.find((a) => a.id === value) || null;
                      updateFlightField(flight.id, "arrivalAirport", airport);
                    }}
                  >
                    <SelectTrigger id={`arrival-${flight.id}`}>
                      <SelectValue placeholder="Select arrival airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((airport) => (
                        <SelectItem key={airport.id} value={airport.id}>
                          {airport.code} - {airport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formData.hasConnectingFlights && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Transit Airports</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddTransitAirport(flight.id)}
                      className="text-xs flex items-center"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Transit
                    </Button>
                  </div>
                  
                  {flight.transitAirports.length > 0 ? (
                    <div className="space-y-2">
                      {flight.transitAirports.map((transit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Select
                              value={transit?.id || ""}
                              onValueChange={(value) => {
                                const airport = airports.find((a) => a.id === value) || null;
                                if (airport) {
                                  handleUpdateTransitAirport(flight.id, index, airport);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select transit airport" />
                              </SelectTrigger>
                              <SelectContent>
                                {airports.map((airport) => (
                                  <SelectItem key={airport.id} value={airport.id}>
                                    {airport.code} - {airport.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTransitAirport(flight.id, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No transit airports added</p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`date-${flight.id}`}>Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id={`date-${flight.id}`}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !flight.departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flight.departureDate ? (
                          format(flight.departureDate, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={flight.departureDate || undefined}
                        onSelect={(date) => updateFlightField(flight.id, "departureDate", date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor={`flight-number-${flight.id}`}>Flight Number</Label>
                  <Select
                    value={flight.flightNumber || ""}
                    onValueChange={(value) => updateFlightField(flight.id, "flightNumber", value)}
                  >
                    <SelectTrigger id={`flight-number-${flight.id}`}>
                      <SelectValue placeholder="Select flight number" />
                    </SelectTrigger>
                    <SelectContent>
                      {flightNumbers.map((number) => (
                        <SelectItem key={number} value={number}>
                          {number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {formData.hasConnectingFlights && (
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={addFlight}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Flight
          </Button>
        )}
        
        <div className="mt-8 flex justify-end">
          <Button 
            type="submit" 
            disabled={!validateForm()}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FlightInfoForm;
