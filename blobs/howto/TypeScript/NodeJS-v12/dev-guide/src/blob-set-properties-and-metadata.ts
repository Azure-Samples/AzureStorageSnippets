import {
  BlobClient,
  BlobGetPropertiesResponse,
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadOptions,
  ContainerCreateOptions,
  Metadata,
  BlobHTTPHeaders
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <snippet_setBlobMetadata>
async function setBlobMetadata(
  blobClient: BlobClient
): Promise<void> {
  const metadata: Metadata = {
    docType: 'text',
    category: 'reference'
  };

  await blobClient.setMetadata(metadata);
}
// </snippet_setBlobMetadata>

// <snippet_setHTTPHeaders>
async function setHTTPHeaders(
  blobClient: BlobClient
): Promise<void> {
  // Get existing properties
  const properties = await blobClient.getProperties();

  // Set the blobContentType and blobContentLanguage headers
  // Populate the remaining headers from the existing properties
  const blobHeaders: BlobHTTPHeaders = {
    blobContentType: 'text/plain',
    blobContentLanguage: 'en-us',
    blobContentEncoding: properties.contentEncoding,
    blobCacheControl: properties.cacheControl,
    blobContentDisposition: properties.contentDisposition,
    blobContentMD5: properties.contentMD5
  };

  await blobClient.setHTTPHeaders(blobHeaders);
}
// </snippet_setHTTPHeaders>

// <snippet_getProperties>
async function getProperties(
  blobClient: BlobClient
): Promise<void> {
  const propertiesResponse: BlobGetPropertiesResponse =
    await blobClient.getProperties();

  console.log(`blobType: ${propertiesResponse.blobType}`);
  console.log(`contentType: ${propertiesResponse.contentType}`);
  console.log(`contentLength: ${propertiesResponse.contentLength}`);
  console.log(`lastModified: ${propertiesResponse.lastModified}`);
}
// </snippet_getProperties>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  const blobClient = containerClient.getBlobClient('sample-blob.txt');

  await setBlobMetadata(blobClient);
  await setHTTPHeaders(blobClient);
  await getProperties(blobClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
