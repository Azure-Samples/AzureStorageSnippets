// Azure Storage dependency
const {
  BlobServiceClient,
  BlobLeaseClient,
  BlockBlobClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol
} = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

// For development environment - include environment variables from .env
require("dotenv").config();

// TODO: Replace with your actual storage account name
const accountNameSrc = "<storage-account-name-src>";
const accountNameDest = "<storage-account-name-dest>";

async function main() {
  // create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountNameSrc}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  const blobServiceClientDest = new BlobServiceClient(
    `https://${accountNameDest}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const sourceBlob = blobServiceClient
    .getContainerClient("source-container")
    .getBlockBlobClient("sample-blob.txt");

  const destinationBlob = blobServiceClientDest
    .getContainerClient("destination-container")
    .getBlockBlobClient("sample-blob-copy.txt");

  copyAcrossStorageAccountsAsync(sourceBlob, destinationBlob, blobServiceClient);

  const sourceURL = "<source-url>";
  const destBlob = blobServiceClient
    .getContainerClient("sample-container")
    .getBlockBlobClient("sample-blob-copy.txt");

  copyFromExternalSource(sourceURL, destBlob);
}

// <Snippet_copy_from_azure_async>
async function copyAcrossStorageAccountsAsync(sourceBlob, destinationBlob, blobServiceClient) {
  // Lease the source blob to prevent changes during the copy operation
  const sourceBlobLease = new BlobLeaseClient(sourceBlob);

  // Create a SAS token that's valid for 1 hour
  const sasToken = await generateUserDelegationSAS(sourceBlob, blobServiceClient);
  const sourceBlobSASURL = sourceBlob.url + "?" + sasToken;

  try {
    await sourceBlobLease.acquireLease(-1);

    // Start the copy operation and wait for it to complete
    const copyPoller = await destinationBlob.beginCopyFromURL(sourceBlobSASURL);
    await copyPoller.pollUntilDone();
  } catch (error) {
    // Handle the exception
  } finally {
    // Release the lease once the copy operation completes
    await sourceBlobLease.releaseLease();
  }
}

async function generateUserDelegationSAS(sourceBlob, blobServiceClient) {
  // Get a user delegation key for the Blob service that's valid for 1 hour, as an example
  const delegationKeyStart = new Date();
  const delegationKeyExpiry = new Date(Date.now() + 3600000);
  const userDelegationKey = await blobServiceClient.getUserDelegationKey(
    delegationKeyStart,
    delegationKeyExpiry
  );

  // Create a SAS token that's valid for 1 hour, as an example
  const sasTokenStart = new Date();
  const sasTokenExpiry = new Date(Date.now() + 3600000);
  const blobName = sourceBlob.name;
  const containerName = sourceBlob.containerName;
  const sasOptions = {
    blobName,
    containerName,
    permissions: BlobSASPermissions.parse("r"),
    startsOn: sasTokenStart,
    expiresOn: sasTokenExpiry,
    protocol: SASProtocol.HttpsAndHttp
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    userDelegationKey,
    blobServiceClient.accountName
  ).toString();

  return sasToken.toString();
}
// </Snippet_copy_from_azure_async>

// <Snippet_copy_blob_external_source_async>
async function copyFromExternalSource(sourceURL, destinationBlob) {
  const copyPoller = await destinationBlob.beginCopyFromURL(sourceURL);
  await copyPoller.pollUntilDone();
}
// </Snippet_copy_blob_external_source_async>

// <Snippet_check_copy_status_async>
async function checkCopyStatus(destinationBlob) {
  const properties = await destinationBlob.getProperties();
  console.log(properties.copyStatus);
}
// </Snippet_check_copy_status_async>

// <Snippet_abort_copy_async>
async function abortCopy(destinationBlob) {
  const properties = await destinationBlob.getProperties();

  // Check the copy status and abort if pending
  if (properties.copyStatus === "pending") {
    await destinationBlob.abortCopyFromURL(properties.copyId);
  }
}
// </Snippet_abort_copy_async>

main()
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
