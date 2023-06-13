// Import dependencies
import {
  BlobServiceClient,
  BlobLeaseClient,
  BlobClient
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Replace with your actual storage account name
const accountName = "<storage-account-name>";

async function main(): Promise<void> {
  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const blobClient = blobServiceClient
    .getContainerClient("sample-container")
    .getBlobClient("sample-blob.txt");

  // Acquire lease
  const leaseClient = await acquireBlobLeaseAsync(blobClient);
  // Output the blob lease status for testing
  console.log((await blobClient.getProperties()).leaseState);

  // Renew lease
  await renewBlobLeaseAsync(blobClient, leaseClient.leaseId);

  // Release lease
  await releaseBlobLeaseAsync(blobClient, leaseClient.leaseId);
  // Output the blob lease status for testing
  console.log((await blobClient.getProperties()).leaseState);

  // Break lease
  //await breakBlobLeaseAsync(blobClient);
}

// <Snippet_AcquireBlobLease>
async function acquireBlobLeaseAsync(blobClient: BlobClient) {
  const leaseClient: BlobLeaseClient = blobClient.getBlobLeaseClient();
  await leaseClient.acquireLease(30);
  return leaseClient;
}
// </Snippet_AcquireBlobLease>

// <Snippet_RenewBlobLease>
async function renewBlobLeaseAsync(blobClient: BlobClient, leaseID: string) {
  const leaseClient: BlobLeaseClient = blobClient.getBlobLeaseClient(leaseID);
  await leaseClient.renewLease();
}
// </Snippet_RenewBlobLease>

// <Snippet_ReleaseBlobLease>
async function releaseBlobLeaseAsync(blobClient: BlobClient, leaseID: string) {
  const leaseClient: BlobLeaseClient = blobClient.getBlobLeaseClient(leaseID);
  await leaseClient.releaseLease();
}
// </Snippet_ReleaseBlobLease>

// <Snippet_BreakBlobLease>
async function breakBlobLeaseAsync(blobClient: BlobClient, breakPeriod: number) {
  const leaseClient: BlobLeaseClient = blobClient.getBlobLeaseClient();
  await leaseClient.breakLease(breakPeriod);
}
// </Snippet_BreakBlobLease>

main()
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
