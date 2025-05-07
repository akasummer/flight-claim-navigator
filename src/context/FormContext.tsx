
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  FormData, 
  Flight, 
  Passenger, 
  Airport, 
  UploadedFile, 
  DisruptionReason, 
  Compensation, 
  FormStep,
  Claim,
  Message,
  Response
} from "@/types";
import { submitClaim, getClaimMessages, mockStatusUpdate, mockRequestAdditionalInfo } from "@/api/mockApi";
import { toast } from "@/components/ui/sonner";

// Add uuid dependency
<lov-add-dependency>uuid@^9.0.0</lov-add-dependency>
<lov-add-dependency>@types/uuid@^9.0.1</lov-add-dependency>

interface FormContextType {
  formData: FormData;
  currentStep: FormStep;
  claim: Claim | null;
  isSubmitting: boolean;
  isLoading: boolean;
  setCurrentStep: (step: FormStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFlightField: (flightId: string, field: string, value: any) => void;
  setHasConnectingFlights: (value: boolean) => void;
  addFlight: () => void;
  removeFlight: (id: string) => void;
  updateMainPassenger: (field: string, value: string) => void;
  addFellowPassenger: () => void;
  removeFellowPassenger: (id: string) => void;
  updateFellowPassenger: (id: string, field: string, value: string) => void;
  setDisruptionReason: (reason: DisruptionReason | null) => void;
  setCompensation: (compensation: Compensation | null) => void;
  setCommunicationDetails: (details: string) => void;
  setTicketFile: (file: UploadedFile | null) => void;
  addEvidenceFile: (file: UploadedFile) => void;
  removeEvidenceFile: (id: string) => void;
  submitForm: () => Promise<void>;
  addMessage: (message: Message) => void;
  addResponse: (response: Response) => void;
  simulateStatusUpdate: () => Promise<void>;
  simulateNewMessage: () => Promise<void>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const createEmptyFlight = (): Flight => ({
  id: uuidv4(),
  departureAirport: null,
  arrivalAirport: null,
  transitAirports: [],
  departureDate: null,
  flightNumber: "",
});

const createEmptyPassenger = (): Passenger => ({
  id: uuidv4(),
  firstName: "",
  lastName: "",
  email: "",
});

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>({
    flights: [createEmptyFlight()],
    hasConnectingFlights: false,
    mainPassenger: createEmptyPassenger(),
    fellowPassengers: [],
    disruptionReason: null,
    compensation: null,
    communicationDetails: "",
    ticketFile: null,
    evidenceFiles: [],
  });

  const [currentStep, setCurrentStep] = useState<FormStep>("FLIGHT_INFO");
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prevStep) => {
      switch (prevStep) {
        case "FLIGHT_INFO":
          return "PERSONAL_INFO";
        case "PERSONAL_INFO":
          return "CLAIM_DETAILS";
        case "CLAIM_DETAILS":
          return "STATUS";
        default:
          return prevStep;
      }
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prevStep) => {
      switch (prevStep) {
        case "PERSONAL_INFO":
          return "FLIGHT_INFO";
        case "CLAIM_DETAILS":
          return "PERSONAL_INFO";
        case "STATUS":
          return "CLAIM_DETAILS";
        default:
          return prevStep;
      }
    });
  }, []);

  const updateFlightField = useCallback((flightId: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      flights: prev.flights.map((flight) =>
        flight.id === flightId ? { ...flight, [field]: value } : flight
      ),
    }));
  }, []);

  const setHasConnectingFlights = useCallback((value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasConnectingFlights: value,
      // Reset transit airports if no connecting flights
      flights: prev.flights.map((flight) => ({
        ...flight,
        transitAirports: value ? flight.transitAirports : [],
      })),
    }));
  }, []);

  const addFlight = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      flights: [...prev.flights, createEmptyFlight()],
    }));
  }, []);

  const removeFlight = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      flights: prev.flights.filter((flight) => flight.id !== id),
    }));
  }, []);

  const updateMainPassenger = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      mainPassenger: { ...prev.mainPassenger, [field]: value },
    }));
  }, []);

  const addFellowPassenger = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      fellowPassengers: [...prev.fellowPassengers, createEmptyPassenger()],
    }));
  }, []);

  const removeFellowPassenger = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      fellowPassengers: prev.fellowPassengers.filter((passenger) => passenger.id !== id),
    }));
  }, []);

  const updateFellowPassenger = useCallback(
    (id: string, field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        fellowPassengers: prev.fellowPassengers.map((passenger) =>
          passenger.id === id ? { ...passenger, [field]: value } : passenger
        ),
      }));
    },
    []
  );

  const setDisruptionReason = useCallback((reason: DisruptionReason | null) => {
    setFormData((prev) => ({
      ...prev,
      disruptionReason: reason,
    }));
  }, []);

  const setCompensation = useCallback((compensation: Compensation | null) => {
    setFormData((prev) => ({
      ...prev,
      compensation,
    }));
  }, []);

  const setCommunicationDetails = useCallback((details: string) => {
    setFormData((prev) => ({
      ...prev,
      communicationDetails: details,
    }));
  }, []);

  const setTicketFile = useCallback((file: UploadedFile | null) => {
    setFormData((prev) => ({
      ...prev,
      ticketFile: file,
    }));
  }, []);

  const addEvidenceFile = useCallback((file: UploadedFile) => {
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, file],
    }));
  }, []);

  const removeEvidenceFile = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((file) => file.id !== id),
    }));
  }, []);

  const submitForm = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Submit the form data
      const submittedClaim = await submitClaim(formData);
      setClaim(submittedClaim);
      
      // Get initial messages
      setIsLoading(true);
      const messages = await getClaimMessages(submittedClaim.id);
      
      // Update claim with messages
      setClaim((prevClaim) => {
        if (!prevClaim) return submittedClaim;
        return {
          ...prevClaim,
          messages,
        };
      });
      
      toast.success("Claim submitted successfully!");
      goToNextStep();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }, [formData, goToNextStep]);

  const addMessage = useCallback((message: Message) => {
    setClaim((prevClaim) => {
      if (!prevClaim) return null;
      return {
        ...prevClaim,
        messages: [...prevClaim.messages, message],
      };
    });
  }, []);

  const addResponse = useCallback((response: Response) => {
    setClaim((prevClaim) => {
      if (!prevClaim) return null;
      return {
        ...prevClaim,
        responses: [...prevClaim.responses, response],
      };
    });
  }, []);

  const simulateStatusUpdate = useCallback(async () => {
    if (!claim) return;
    
    setIsLoading(true);
    try {
      const newStatus = await mockStatusUpdate(claim.id);
      
      setClaim((prevClaim) => {
        if (!prevClaim) return null;
        return {
          ...prevClaim,
          status: newStatus,
        };
      });
      
      toast.info(`Claim status updated to ${newStatus.replace("_", " ").toLowerCase()}`);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [claim]);

  const simulateNewMessage = useCallback(async () => {
    if (!claim) return;
    
    setIsLoading(true);
    try {
      const newMessage = await mockRequestAdditionalInfo(claim.id);
      
      setClaim((prevClaim) => {
        if (!prevClaim) return null;
        return {
          ...prevClaim,
          messages: [...prevClaim.messages, newMessage],
          status: "MORE_INFO_NEEDED",
        };
      });
      
      toast.info("New message received", {
        description: "The airline requires additional information.",
      });
    } catch (error) {
      console.error("Error requesting additional info:", error);
    } finally {
      setIsLoading(false);
    }
  }, [claim]);

  const value = {
    formData,
    currentStep,
    claim,
    isSubmitting,
    isLoading,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    updateFlightField,
    setHasConnectingFlights,
    addFlight,
    removeFlight,
    updateMainPassenger,
    addFellowPassenger,
    removeFellowPassenger,
    updateFellowPassenger,
    setDisruptionReason,
    setCompensation,
    setCommunicationDetails,
    setTicketFile,
    addEvidenceFile,
    removeEvidenceFile,
    submitForm,
    addMessage,
    addResponse,
    simulateStatusUpdate,
    simulateNewMessage,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
