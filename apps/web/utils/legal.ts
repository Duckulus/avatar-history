import type { GetServerSideProps } from "next";

// Operator details for the privacy policy and terms. They come from the
// runtime environment so personal data stays out of the public repository.
export interface Operator {
  name: string;
  address: string;
  email: string;
  hosting: string;
  site: string;
}

export const LEGAL_UPDATED = "November 20, 2026";

export const getOperatorProps: GetServerSideProps<{ operator: Operator }> = async () => ({
  props: {
    operator: {
      name: process.env.LEGAL_NAME ?? "",
      address: process.env.LEGAL_ADDRESS ?? "",
      email: process.env.LEGAL_EMAIL ?? "",
      hosting: process.env.LEGAL_HOSTING ?? "",
      site: (process.env.WEB_URL ?? "").replace(/\/+$/, ""),
    },
  },
});
