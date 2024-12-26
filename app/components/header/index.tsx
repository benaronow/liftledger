"use client";

import { styled } from "@mui/material";

export const Header = () => {
  const LLHeader = styled("div")({
    display: "flex",
    flexDirection: "column",
    flex: "1",
    background: "#a3258c",
    justifyContent: "center",
    alignItems: "center",
  });

  type LLTitleProps = {
    fontFamily: string;
    fontWeight: string;
  };

  const LLTitle = styled("span")<LLTitleProps>(
    ({ fontFamily, fontWeight }) => ({
      color: "white",
      fontSize: "30px",
      fontFamily: fontFamily,
      fontWeight: fontWeight,
    })
  );

  return (
    <>
      <LLHeader>
        <LLTitle fontFamily="Audiowide" fontWeight="400">
          1. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Anta" fontWeight="400">
          2. LiftLedger
        </LLTitle>
        {/* <LLTitle fontFamily="Bowlby One SC" fontWeight="400">
          3. LiftLedger
        </LLTitle> */}
        <LLTitle fontFamily="Belanosima" fontWeight="600">
          4. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Fugaz One" fontWeight="400">
          5. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Racing Sans One" fontWeight="400">
          6. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Edu AU VIC WA NT Guides" fontWeight="700">
          7. LiftLedger
        </LLTitle>
        {/* <LLTitle fontFamily="Alkatra" fontWeight="600">
          8. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Shrikhand" fontWeight="400">
          9. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Contrail One" fontWeight="400">
          10. LiftLedger
        </LLTitle> */}
        <LLTitle fontFamily="Zen Dots" fontWeight="400">
          11. LiftLedger
        </LLTitle>
        {/* <LLTitle fontFamily="Iceberg" fontWeight="400">
          12. LiftLedger
        </LLTitle> */}
        <LLTitle fontFamily="Jockey One" fontWeight="400">
          13. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Goldman" fontWeight="700">
          14. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Space Mono" fontWeight="700">
          15. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="ZCOOL QingKe HuangYou" fontWeight="400">
          16. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Mina" fontWeight="700">
          17. LiftLedger
        </LLTitle>
        {/* <LLTitle fontFamily="Odibee Sans" fontWeight="400">
          18. LiftLedger
        </LLTitle> */}
        <LLTitle fontFamily="Baumans" fontWeight="400">
          19. LiftLedger
        </LLTitle>
        {/* <LLTitle fontFamily="Keania One" fontWeight="400">
          20. LiftLedger
        </LLTitle> */}
      </LLHeader>
    </>
  );
};
