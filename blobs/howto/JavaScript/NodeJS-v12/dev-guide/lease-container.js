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

  const blobContainerClient = blobServiceClient.getContainerClient("sample-container");

  // acquire lease
  const leaseClient = await acquireContainerLeaseAsync(blobContainerClient);
  // output the blob lease status for testing
  console.log((await blobContainerClient.getProperties()).leaseState);

  // renew lease
  await renewContainerLeaseAsync(blobContainerClient, leaseClient.leaseId);

  // release lease
  await releaseContainerLeaseAsync(blobContainerClient, leaseClient.leaseId);
  // output the blob lease status for testing
  console.log((await blobContainerClient.getProperties()).leaseState);

  // break lease
  //await breakContainerLeaseAsync(blobContainerClient);
}

// <Snippet_AcquireContainerLease>
async function acquireContainerLeaseAsync(blobContainerClient) {
  const leaseClient = blobContainerClient.getBlobLeaseClient();
  await leaseClient.acquireLease(30);
  return leaseClient;
}
// </Snippet_AcquireContainerLease>

// <Snippet_RenewContainerLease>
async function renewContainerLeaseAsync(blobContainerClient, leaseID) {
  const leaseClient = blobContainerClient.getBlobLeaseClient(leaseID);
  await leaseClient.renewLease();
}
// </Snippet_RenewContainerLease>

// <Snippet_ReleaseContainerLease>
async function releaseContainerLeaseAsync(blobContainerClient, leaseID) {
  const leaseClient = blobContainerClient.getBlobLeaseClient(leaseID);
  await leaseClient.releaseLease();
}
// </Snippet_ReleaseContainerLease>

// <Snippet_BreakContainerLease>
async function breakContainerLeaseAsync(blobContainerClient) {
  const leaseClient = blobContainerClient.getBlobLeaseClient();
  await leaseClient.breakLease();
}
// </Snippet_BreakContainerLease>

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
