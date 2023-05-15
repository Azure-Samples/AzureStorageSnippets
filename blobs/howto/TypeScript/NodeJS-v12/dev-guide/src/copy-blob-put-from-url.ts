// Azure Storage dependency
import {
  BlobServiceClient,
  BlockBlobClient
} from '@azure/storage-blob';

// Azure authentication for credential dependency
import { DefaultAzureCredential } from '@azure/identity';

// For development environment - include environment variables from .env
import * as dotenv from "dotenv";
dotenv.config();

// TODO: Replace with your actual storage account name
const accountName: string = "<storage-account-name>";

async function main() {
  // create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const sourceBlob: BlockBlobClient = blobServiceClient
    .getContainerClient("source-container")
    .getBlockBlobClient("sample-blob.txt");

  const destinationBlob: BlockBlobClient = blobServiceClient
    .getContainerClient("destination-container")
    .getBlockBlobClient("sample-blob-copy.txt");

  await copyFromSourceInAzure(sourceBlob, destinationBlob);

  const sourceURL: string = "source-url";
  const destBlob: BlockBlobClient = blobServiceClient
    .getContainerClient("sample-container")
    .getBlockBlobClient("sample-blob-copy.txt");

  await copyFromExternalSource(sourceURL, destBlob);
}

// <Snippet_copy_from_azure_put_blob_from_url>
async function copyFromSourceInAzure(
  sourceBlob: BlockBlobClient,
  destinationBlob: BlockBlobClient
): Promise<void> {
  // Get the source blob URL and create the destination blob
  await destinationBlob.syncUploadFromURL(sourceBlob.url);
}
// </Snippet_copy_from_azure_put_blob_from_url>

// <Snippet_copy_from_external_source_put_blob_from_url>
async function copyFromExternalSource(
  sourceUrl: string,
  destinationBlob: BlockBlobClient
): Promise<void> {
  // Create the destination blob from the source URL
  await destinationBlob.syncUploadFromURL(sourceUrl);
}
// </Snippet_copy_from_external_source_put_blob_from_url>

main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));