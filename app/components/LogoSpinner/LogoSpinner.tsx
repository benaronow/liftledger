"use client";

import styles from "./logoSpinner.module.css";
export const LogoSpinner = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100dvh", paddingBottom: "10px" }}
    >
      <img
        className={styles.logo}
        src="/icon.png"
        alt="Loading"
        height={50}
        width={50}
      />
    </div>
  );
};
