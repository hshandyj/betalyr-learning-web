import { createContext, useContext } from "react";
import { Document } from "@/types/document";

export const DocumentContext = createContext<{
  document: Document | null;
  isLoading: boolean;
  error: unknown;
}>({
  document: null,
  isLoading: true,
  error: null,
});

export const useDocument = () => useContext(DocumentContext); 