import { SizeInfo } from "@/types";
import { useEffect, useState } from "react";

export const useInnerSize = () => {
  const [innerSize, setInnerSize] = useState <SizeInfo> (
    { innerWidth: undefined, innerHeight: undefined }
  );

  const updateSize = () => {
    setInnerSize({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined")
      setInnerSize({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
      window.addEventListener("resize", updateSize);
  }, []);

  return innerSize;
};
