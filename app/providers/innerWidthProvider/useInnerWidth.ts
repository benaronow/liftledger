import { useEffect, useState } from "react";

export const useInnerWidth = () => {
  const [innerWidth, setInnerWidth] = useState(
      typeof window !== "undefined"
        ? window.innerWidth
        : undefined
    );
    const updateWidth = () => {
      setInnerWidth(window.innerWidth);
    };
    useEffect(() => {
      if (typeof window !== "undefined")
        window.addEventListener("resize", updateWidth);
    }, []);

  return { innerWidth };
};
