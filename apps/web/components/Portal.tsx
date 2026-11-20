import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

// Renders children into <body>, e.g. position: fixed overlays that must not be
// contained by a transformed or backdrop-filtered ancestor. Only mount it on
// the client (after an interaction), document doesn't exist during SSR.
export function Portal({ children }: PropsWithChildren) {
  // @types/react-dom ships its own nested @types/react, whose ReactNode type
  // differs from ours
  return createPortal(children as any, document.body) as unknown as JSX.Element;
}
