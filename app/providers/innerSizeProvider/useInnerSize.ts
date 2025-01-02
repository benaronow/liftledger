import { useEffect, useState } from "react";

export const useInnerSize = () => {
  const [innerSize, setInnerSize] = useState(
    typeof window !== "undefined"
      ? { innerWidth: window.innerWidth, innerHeight: window.innerHeight }
      : { innerWidth: undefined, innerHeight: undefined }
  );
  const updateSize = () => {
    setInnerSize({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
  };
  useEffect(() => {
    if (typeof window !== "undefined")
      window.addEventListener("resize", updateSize);
  }, []);

  return innerSize;
};
