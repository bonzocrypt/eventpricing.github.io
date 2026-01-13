// C:\EventPricing\eventpricing\src\lib\ingest\env.ts

export function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export function getOptionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v || undefined;
}

// Provider keys
export function getTicketmasterApiKey(): string {
  return getRequiredEnv("TICKETMASTER_API_KEY");
}
