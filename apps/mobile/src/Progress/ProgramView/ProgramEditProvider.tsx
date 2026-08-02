import { Program } from "@liftledger/shared";
import { useUpdateHistoricalProgram } from "@liftledger/api-client";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ProgramEditContextModel {
  program: Program;
  setProgram: Dispatch<SetStateAction<Program>>;
  dirty: boolean;
  saving: boolean;
  save: () => Promise<void>;
  reset: () => void;
}

const ProgramEditContext = createContext<ProgramEditContextModel | null>(null);

interface Props extends PropsWithChildren {
  serverProgram: Program;
}

export const ProgramEditProvider = ({ serverProgram, children }: Props) => {
  const [program, setProgram] = useState<Program>(serverProgram);
  const [baseline, setBaseline] = useState<Program>(serverProgram);
  const { send, isLoading: saving } = useUpdateHistoricalProgram(
    serverProgram._id ?? "",
  );

  const dirty = useMemo(
    () => JSON.stringify(program) !== JSON.stringify(baseline),
    [program, baseline],
  );

  const serverKey = useMemo(
    () => JSON.stringify(serverProgram),
    [serverProgram],
  );

  useEffect(() => {
    if (!dirty && serverKey !== JSON.stringify(baseline)) {
      setBaseline(serverProgram);
      setProgram(serverProgram);
    }
  }, [serverKey, dirty, baseline, serverProgram]);

  const reset = useCallback(() => setProgram(baseline), [baseline]);

  const save = useCallback(async () => {
    const res = await send({ program });
    setBaseline(res.program);
    setProgram(res.program);
  }, [send, program]);

  const value = useMemo(
    () => ({ program, setProgram, dirty, saving, save, reset }),
    [program, dirty, saving, save, reset],
  );

  return (
    <ProgramEditContext.Provider value={value}>
      {children}
    </ProgramEditContext.Provider>
  );
};

export const useProgramEdit = () => {
  const ctx = useContext(ProgramEditContext);
  if (!ctx)
    throw new Error("useProgramEdit must be used within a ProgramEditProvider");
  return ctx;
};
