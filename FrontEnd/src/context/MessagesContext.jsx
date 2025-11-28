// context/MessagesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getConversations } from "../services/messagesService";
import { useAuth } from "./AuthContext";

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};

export const MessagesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const result = await getConversations();
    if (result.success) {
      // Contar cuántas conversaciones tienen mensajes no leídos (1 por conversación)
      const total = result.data.filter(conv => parseInt(conv.unread_count) > 0).length;
      setUnreadCount(total);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      updateUnreadCount();

      // Actualizar cada 10 segundos
      const interval = setInterval(updateUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value = {
    unreadCount,
    updateUnreadCount
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
