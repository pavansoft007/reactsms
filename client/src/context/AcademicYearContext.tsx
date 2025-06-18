import { createContext, useContext, useState } from 'react';
export type AcademicYear = { id: number; school_year: string };

interface AcademicYearContextType {
  academicYear: AcademicYear | null;
  setAcademicYear: (year: AcademicYear) => void;
  years: AcademicYear[];
  setYears: (years: AcademicYear[]) => void;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export const AcademicYearProvider = ({ children }) => {
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  return (
    <AcademicYearContext.Provider value={{ academicYear, setAcademicYear, years, setYears }}>
      {children}
    </AcademicYearContext.Provider>
  );
};

export const useAcademicYear = () => {
  const context = useContext(AcademicYearContext);
  if (!context) throw new Error("useAcademicYear must be used within AcademicYearProvider");
  return context;
};
