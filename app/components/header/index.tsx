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
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
  };

  const LLTitle = styled("span")<LLTitleProps>(
    ({ fontSize, fontFamily, fontWeight }) => ({
      color: "white",
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
    })
  );

  return (
    <>
      <LLHeader>
        <LLTitle fontSize="25px" fontFamily="Mina" fontWeight="700">
          LiftLedger
        </LLTitle>
        {/* <div style={{ display: "flex" }}>
          <div style={{ transform: "translate(0, -9px)" }}>
            <LLTitle fontSize="55px" fontFamily="Iceberg" fontWeight="700">
              L
            </LLTitle>
          </div>
          <LLTitle fontSize="40px" fontFamily="Mina" fontWeight="700">
            ift
          </LLTitle>
          <div style={{ transform: "translate(0, -9px)" }}>
            <LLTitle fontSize="55px" fontFamily="Iceberg" fontWeight="700">
              L
            </LLTitle>
          </div>
          <LLTitle fontSize="40px" fontFamily="Mina" fontWeight="700">
            edger
          </LLTitle>
        </div> */}
        {/* <div style={{ display: "flex" }}>
          <div style={{ transform: "translate(0, -17px)" }}>
            <LLTitle fontSize="55px" fontFamily="Jockey One" fontWeight="700">
              L
            </LLTitle>
          </div>
          <LLTitle fontSize="40px" fontFamily="Mina" fontWeight="700">
            ift
          </LLTitle>
          <div style={{ transform: "translate(0, -17px)" }}>
            <LLTitle fontSize="55px" fontFamily="Jockey One" fontWeight="700">
              L
            </LLTitle>
          </div>
          <LLTitle fontSize="40px" fontFamily="Mina" fontWeight="700">
            edger
          </LLTitle>
        </div> */}
        {/* <LLTitle fontFamily="Audiowide" fontWeight="400">
          1. LiftLedger
        </LLTitle>
        <LLTitle fontFamily="Anta" fontWeight="400">
          2. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Bowlby One SC" fontWeight="400">
          3. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Belanosima" fontWeight="600">
          4. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Fugaz One" fontWeight="400">
          5. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Racing Sans One" fontWeight="400">
          6. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Edu AU VIC WA NT Guides" fontWeight="700">
          7. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Alkatra" fontWeight="600">
          8. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Shrikhand" fontWeight="400">
          9. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Contrail One" fontWeight="400">
          10. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Zen Dots" fontWeight="400">
          11. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Iceberg" fontWeight="400">
          12. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Jockey One" fontWeight="400">
          13. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Goldman" fontWeight="700">
          LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Space Mono" fontWeight="700">
          15. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="ZCOOL QingKe HuangYou" fontWeight="400">
          16. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Mina" fontWeight="700">
          LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Odibee Sans" fontWeight="400">
          18. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Baumans" fontWeight="400">
          19. LiftLedger
        </LLTitle> */}
        {/* <LLTitle fontFamily="Keania One" fontWeight="400">
          20. LiftLedger
        </LLTitle> */}
      </LLHeader>
    </>
  );
};
