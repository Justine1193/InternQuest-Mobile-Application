import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationCountContextType = {
  notificationCount: number;
  setNotificationCount: (n: number | ((prev: number) => number)) => void;
};

const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined);

export const NotificationCountProvider = ({ children }: { children: ReactNode }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  return (
    <NotificationCountContext.Provider value={{ notificationCount, setNotificationCount }}>
      {children}
    </NotificationCountContext.Provider>
  );
};

export const useNotificationCount = () => {
  const context = useContext(NotificationCountContext);
  if (context === undefined) {
    throw new Error('useNotificationCount must be used within a NotificationCountProvider');
  }
  return context;
};
