// Import dependencies
import {
  BlobServiceClient,
  BlobLeaseClient,
  ContainerClient
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

  const blobContainerClient = blobServiceClient
    .getContainerClient("sample-container");

  // Acquire lease
  const leaseClient = await acquireBlobLeaseAsync(blobContainerClient);
  // Output the blob lease status for testing
  console.log((await blobContainerClient.getProperties()).leaseState);

  // Renew lease
  await renewBlobLeaseAsync(blobContainerClient, leaseClient.leaseId);

  // Release lease
  await releaseBlobLeaseAsync(blobContainerClient, leaseClient.leaseId);
  // Output the blob lease status for testing
  console.log((await blobContainerClient.getProperties()).leaseState);

  // Break lease
  //await breakBlobLeaseAsync(blobClient);
}

// <Snippet_AcquireBlobLease>
async function acquireBlobLeaseAsync(blobContainerClient: ContainerClient) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient();
  await leaseClient.acquireLease(30);
  return leaseClient;
}
// </Snippet_AcquireBlobLease>

// <Snippet_RenewBlobLease>
async function renewBlobLeaseAsync(blobContainerClient: ContainerClient, leaseID: string) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient(leaseID);
  await leaseClient.renewLease();
}
// </Snippet_RenewBlobLease>

// <Snippet_ReleaseBlobLease>
async function releaseBlobLeaseAsync(blobContainerClient: ContainerClient, leaseID: string) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient(leaseID);
  await leaseClient.releaseLease();
}
// </Snippet_ReleaseBlobLease>

// <Snippet_BreakBlobLease>
async function breakBlobLeaseAsync(blobContainerClient: ContainerClient, breakPeriod: number) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient();
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