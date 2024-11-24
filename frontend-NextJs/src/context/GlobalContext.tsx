"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface FileData {
  name?: string; // Optional field
  size?: number | null; // Optional field
  row_count?: number;
  column_count?: number;
  duplicate_count?: number;
  unique_count?: number;
  total_number_blank_cells?: number;
  data: { 
    [key: string]: any; 
  }[];
  headers_types: { 
    [key:string]: any
  } | {};
  numeric_columns_stats?: {
    [key: string]: {
      Min: number;
      Max: number;
      Standard_Deviation: number;
      Variance: number;
      Mean: number;
      Median: number;
      Mode: number | null;
      Quartiles: {
        Q1: number;
        "Q2 (Median)": number;
        Q3: number;
      };
    };
  };
}


interface GlobalContextValue {
  fileData: FileData;
  setFileData: React.Dispatch<React.SetStateAction<FileData>>;
  resetFileData: () => void; 
}

export const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [fileData, setFileData] = useState<FileData>(initialFileData);

  // Memoize the reset function to prevent re-renders
  const resetFileData = useCallback(() => {
    setFileData(initialFileData);
  }, []);

  return (
    <GlobalContext.Provider value={{ fileData, setFileData, resetFileData }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextValue => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};


export const initialFileData: FileData = { 
  name: "", 
  size: null, 
  headers_types: {}, 
  data: [] 
};
