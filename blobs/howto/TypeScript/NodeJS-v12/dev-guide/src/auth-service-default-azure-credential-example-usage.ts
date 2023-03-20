import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient without secrets
import { getBlobServiceClient } from './auth-service-default-azure-credential';

async function main() {
  // get client
  const client = getBlobServiceClient;

  // use client
  // RBAC must be set up for your identity with one of the following roles:
  // Storage Account Contributor
  const serviceGetPropertiesResponse = await client.getProperties();
  console.log(`${JSON.stringify(serviceGetPropertiesResponse)}`);
}

main()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
