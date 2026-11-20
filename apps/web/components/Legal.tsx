import { Operator } from "../utils/legal";

// Visible marker for operator details that are not configured in .env yet
export function Missing({ what }: { what: string }) {
  return <mark className={"legal-missing"}>[{what} not configured]</mark>;
}

export function OperatorBlock({ operator }: { operator: Operator }) {
  return (
    <address className={"legal-operator"}>
      {operator.name || <Missing what={"LEGAL_NAME"} />}
      <br />
      {operator.address ? (
        operator.address.split(/\s*\|\s*|\n/).map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))
      ) : (
        <>
          <Missing what={"LEGAL_ADDRESS"} />
          <br />
        </>
      )}
      {operator.email ? <a href={`mailto:${operator.email}`}>{operator.email}</a> : <Missing what={"LEGAL_EMAIL"} />}
    </address>
  );
}
