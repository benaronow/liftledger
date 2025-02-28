import { createContext, ReactNode, useContext, useState } from "react";

interface MenuOpenContextType {
  menuOpen: boolean;
  toggleMenuOpen: () => void;
}

const defaultMenuOpenContext: MenuOpenContextType = {
  menuOpen: false,
  toggleMenuOpen: () => {},
};

export const MenuOpenContext = createContext(defaultMenuOpenContext);

interface MenuOpenProviderProps {
  readonly children: ReactNode;
}

export const MenuOpenProvider = ({ children }: MenuOpenProviderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenuOpen = () => setMenuOpen((prev) => !prev);

  return (
    <MenuOpenContext value={{ menuOpen, toggleMenuOpen }}>
      {children}
    </MenuOpenContext>
  );
};

export const useTheme = () => useContext(MenuOpenContext);
