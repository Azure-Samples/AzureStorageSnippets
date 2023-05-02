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
  const leaseClient = await acquireContainerLeaseAsync(blobContainerClient);
  // Output the blob lease status for testing
  console.log((await blobContainerClient.getProperties()).leaseState);

  // Renew lease
  await renewContainerLeaseAsync(blobContainerClient, leaseClient.leaseId);

  // Release lease
  await releaseContainerLeaseAsync(blobContainerClient, leaseClient.leaseId);
  // Output the blob lease status for testing
  console.log((await blobContainerClient.getProperties()).leaseState);

  // Break lease
  //await breakContainerLeaseAsync(blobClient);
}

// <Snippet_AcquireContainerLease>
async function acquireContainerLeaseAsync(blobContainerClient: ContainerClient) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient();
  await leaseClient.acquireLease(30);
  return leaseClient;
}
// </Snippet_AcquireContainerLease>

// <Snippet_RenewContainerLease>
async function renewContainerLeaseAsync(blobContainerClient: ContainerClient, leaseID: string) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient(leaseID);
  await leaseClient.renewLease();
}
// </Snippet_RenewContainerLease>

// <Snippet_ReleaseContainerLease>
async function releaseContainerLeaseAsync(blobContainerClient: ContainerClient, leaseID: string) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient(leaseID);
  await leaseClient.releaseLease();
}
// </Snippet_ReleaseContainerLease>

// <Snippet_BreakContainerLease>
async function breakContainerLeaseAsync(blobContainerClient: ContainerClient, breakPeriod: number) {
  const leaseClient: BlobLeaseClient = blobContainerClient.getBlobLeaseClient();
  await leaseClient.breakLease(breakPeriod);
}
// </Snippet_BreakContainerLease>

main()
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });