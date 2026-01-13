import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();
export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {

  // ⭐ Load user from localStorage safely
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  // ⭐ Sync function (React + all tabs)
  const syncUser = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("user"));
      setUser(saved || null);
    } catch {
      setUser(null);
    }
  };

  // ⭐ Listen to custom "user-updated" event + tab changes
  useEffect(() => {
    window.addEventListener("user-updated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("user-updated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // ⭐ Main function to update user everywhere
  const updateUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    // Trigger navbar update in all components
    window.dispatchEvent(new Event("user-updated"));
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
