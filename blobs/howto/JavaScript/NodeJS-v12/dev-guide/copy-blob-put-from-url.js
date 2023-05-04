// Azure Storage dependency
const {
  BlobServiceClient,
  BlockBlobClient
} = require('@azure/storage-blob');

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

  const sourceBlob = blobServiceClient
    .getContainerClient("source-container")
    .getBlockBlobClient("sample-blob.txt");

  const destinationBlob = blobServiceClient
    .getContainerClient("destination-container")
    .getBlockBlobClient("sample-blob-copy.txt");

  copyFromSourceInAzure(sourceBlob, destinationBlob);

  const sourceURL = "source-url";
  const destBlob = blobServiceClient
    .getContainerClient("sample-container")
    .getBlockBlobClient("sample-blob-copy.txt");

  copyFromExternalSource(sourceURL, destBlob);
}

// <Snippet_copy_from_azure_put_blob_from_url>
async function copyFromSourceInAzure(sourceBlob, destinationBlob) {
  // Get the source blob URL and create the destination blob
  await destinationBlob.syncUploadFromURL(sourceBlob.url);
}
// </Snippet_copy_from_azure_put_blob_from_url>

// <Snippet_copy_from_external_source_put_blob_from_url>
async function copyFromExternalSource(sourceUrl, destinationBlob) {
  // Create the destination blob from the source URL
  await destinationBlob.syncUploadFromURL(sourceUrl);
}
// </Snippet_copy_from_external_source_put_blob_from_url>

main()
    .then(() => console.log('done'))
    .catch((ex) => console.log(ex.message));
