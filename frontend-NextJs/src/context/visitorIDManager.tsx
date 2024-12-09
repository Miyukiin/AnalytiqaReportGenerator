import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

const VisitorIdContext = createContext<string | undefined>(undefined);

export const VisitorIdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visitorId, setVisitorId] = useState<string>("");

  useEffect(() => {
    let storedVisitorId = localStorage.getItem("visitorId");

    if (!storedVisitorId) {
      //storedVisitorId = crypto.randomUUID(); // Does not work on mobile versions of localhost.
      storedVisitorId = uuidv4(); 
      localStorage.setItem("visitorId", storedVisitorId);
    } else {
      console.log("Existing Visitor ID:", storedVisitorId);
    }
    setVisitorId(storedVisitorId);
  }, []);

  return (
    <VisitorIdContext.Provider value={visitorId}>
      {children}
    </VisitorIdContext.Provider>
  );
};

export const useVisitorId = (): string => {
  const context = useContext(VisitorIdContext);
  if (context === undefined) {
    throw new Error("useVisitorId must be used within a VisitorIdProvider");
  }
  return context;
};
