import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Post } from '../App';

type SavedInternshipsContextType = {
  savedInternships: Post[];
  toggleSaveInternship: (post: Post) => void;
};

const SavedInternshipsContext = createContext<SavedInternshipsContextType | undefined>(undefined);

export const SavedInternshipsProvider = ({ children }: { children: ReactNode }) => {
  const [savedInternships, setSavedInternships] = useState<Post[]>([]);

  const toggleSaveInternship = (post: Post) => {
    setSavedInternships(prev =>
      prev.some(saved => saved.id === post.id)
        ? prev.filter(saved => saved.id !== post.id) // Remove if already saved
        : [...prev, post] // Add if not saved
    );
  };

  return (
    <SavedInternshipsContext.Provider value={{ savedInternships, toggleSaveInternship }}>
      {children}
    </SavedInternshipsContext.Provider>
  );
};

export const useSavedInternships = () => {
  const context = useContext(SavedInternshipsContext);
  if (!context) {
    throw new Error('useSavedInternships must be used within a SavedInternshipsProvider');
  }
  return context;
};