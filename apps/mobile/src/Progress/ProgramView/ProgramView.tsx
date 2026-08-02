import { Program } from "@liftledger/shared";
import { ProgramEditProvider } from "./ProgramEditProvider";
import { ProgramLeaveGuard } from "./ProgramLeaveGuard";
import { ProgramContent } from "./ProgramContent";

interface Props {
  serverProgram: Program;
  title: string;
  showName?: boolean;
  showBack?: boolean;
}

export const ProgramView = ({
  serverProgram,
  title,
  showName = true,
  showBack,
}: Props) => (
  <ProgramEditProvider key={serverProgram._id} serverProgram={serverProgram}>
    <ProgramContent showName={showName} title={title} showBack={showBack} />
    <ProgramLeaveGuard />
  </ProgramEditProvider>
);
