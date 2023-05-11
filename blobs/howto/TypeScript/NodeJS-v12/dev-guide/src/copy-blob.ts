import {
  BlobServiceClient,
  BlobLeaseClient,
  BlockBlobClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
} from '@azure/storage-blob';

import { DefaultAzureCredential } from '@azure/identity';

require('dotenv').config();

const accountNameSrc: string = '<storage-account-name-src>';
const accountNameDest: string = '<storage-account-name-dest>';

async function main() {
  const blobServiceClient = new BlobServiceClient(
    `https://${accountNameSrc}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  const blobServiceClientDest = new BlobServiceClient(
    `https://${accountNameDest}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const sourceBlob: BlockBlobClient = blobServiceClient
    .getContainerClient('source-container')
    .getBlockBlobClient('sample-blob.txt');

  const destinationBlob: BlockBlobClient = blobServiceClientDest
    .getContainerClient('destination-container')
    .getBlockBlobClient('sample-blob-copy.txt');

  await copyAcrossStorageAccountsAsync(sourceBlob, destinationBlob, blobServiceClient);

  const sourceURL: string = 'source-url';
  const destBlob: BlockBlobClient = blobServiceClient
    .getContainerClient('sample-container')
    .getBlockBlobClient('sample-blob-copy.txt');

  await copyFromExternalSource(sourceURL, destBlob);
}

// <Snippet_copy_from_azure_async>
async function copyAcrossStorageAccountsAsync(
  sourceBlob: BlockBlobClient,
  destinationBlob: BlockBlobClient,
  blobServiceClient: BlobServiceClient
): Promise<void> {
  const sourceBlobLease = new BlobLeaseClient(sourceBlob);

  // Create a SAS token that's valid for 1 hour
  const sasToken = await generateUserDelegationSAS(sourceBlob, blobServiceClient);
  const sourceBlobSASURL: string = sourceBlob.url + '?' + sasToken;

  try {
    await sourceBlobLease.acquireLease(-1);

    const copyPoller = await destinationBlob.beginCopyFromURL(sourceBlobSASURL);
    await copyPoller.pollUntilDone();
  } catch (error) {
    console.log(error);
  } finally {
    await sourceBlobLease.releaseLease();
  }
}

async function generateUserDelegationSAS(
  sourceBlob: BlockBlobClient,
  blobServiceClient: BlobServiceClient
): Promise<string> {
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
async function copyFromExternalSource(sourceURL: string,
  destinationBlob: BlockBlobClient
): Promise<void> {
  try {
    const copyPoller = await destinationBlob.beginCopyFromURL(sourceURL);
    await copyPoller.pollUntilDone();
  } catch (error) {
    console.log(error);
  }
}
// </Snippet_copy_blob_external_source_async>

// <Snippet_check_copy_status_async>
async function checkCopyStatus(destinationBlob: BlockBlobClient): Promise<void> {
  const properties = await destinationBlob.getProperties();
  console.log(properties.copyStatus);
}
// </Snippet_check_copy_status_async>

// <Snippet_abort_copy_async>
async function abortCopy(destinationBlob: BlockBlobClient): Promise<void> {
  const properties = await destinationBlob.getProperties();

  // Check the copy status and abort if pending
  if (properties.copyStatus === "pending") {
    await destinationBlob.abortCopyFromURL(properties.copyId?.toString()!);
  }
}
// </Snippet_abort_copy_async>

main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));