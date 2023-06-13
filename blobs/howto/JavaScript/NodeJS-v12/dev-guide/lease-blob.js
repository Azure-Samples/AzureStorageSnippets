// Azure Storage dependency
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

// For development environment - include environment variables from .env
require("dotenv").config();

// TODO: Replace with your actual storage account name
const accountName = "<storage-account-name>";

async function main() {
  // create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const blobClient = blobServiceClient
    .getContainerClient("sample-container")
    .getBlobClient("sample-blob.txt");

  // acquire lease
  const leaseClient = await acquireBlobLeaseAsync(blobClient);
  // output the blob lease status for testing
  console.log((await blobClient.getProperties()).leaseState);

  // renew lease
  await renewBlobLeaseAsync(blobClient, leaseClient.leaseId);

  // release lease
  await releaseBlobLeaseAsync(blobClient, leaseClient.leaseId);
  // output the blob lease status for testing
  console.log((await blobClient.getProperties()).leaseState);

  // break lease
  //await breakBlobLeaseAsync(blobClient);
}

// <Snippet_AcquireBlobLease>
async function acquireBlobLeaseAsync(blobClient) {
  const leaseClient = blobClient.getBlobLeaseClient();
  await leaseClient.acquireLease(30);
  return leaseClient;
}
// </Snippet_AcquireBlobLease>

// <Snippet_RenewBlobLease>
async function renewBlobLeaseAsync(blobClient, leaseID) {
  const leaseClient = blobClient.getBlobLeaseClient(leaseID);
  await leaseClient.renewLease();
}
// </Snippet_RenewBlobLease>

// <Snippet_ReleaseBlobLease>
async function releaseBlobLeaseAsync(blobClient, leaseID) {
  const leaseClient = blobClient.getBlobLeaseClient(leaseID);
  await leaseClient.releaseLease();
}
// </Snippet_ReleaseBlobLease>

// <Snippet_BreakBlobLease>
async function breakBlobLeaseAsync(blobClient) {
  const leaseClient = blobClient.getBlobLeaseClient();
  await leaseClient.breakLease();
}
// </Snippet_BreakBlobLease>

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
