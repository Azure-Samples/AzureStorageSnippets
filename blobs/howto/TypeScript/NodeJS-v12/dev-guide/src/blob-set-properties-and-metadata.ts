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

// containerName: string
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
async function createBlobFromString(
  client,
  blobName,
  fileContentsAsString,
  uploadOptions: BlockBlobUploadOptions | undefined
): Promise<BlockBlobClient> {
  // Create blob client from container client
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  console.log(`uploading blob ${blobName}`);

  // Upload string
  const uploadResult = await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    uploadOptions
  );

  if (uploadResult.errorCode) throw Error(uploadResult.errorCode);

  // do something with blob
  // ...
  return blockBlobClient;
}
async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  // create container
  const timestamp = Date.now();
  const containerName = `blob-set-properties-and-metadata-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, containerOptions);

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  console.log('container creation succeeded');

  // create blob
  const blob = {
    name: `my-blob.txt`,
    text: `Hello from a string`,
  };

  const options: BlockBlobUploadOptions | undefined = undefined;

  const blobClient = await createBlobFromString(
    containerClient,
    blob.name,
    blob.text,
    options
  );

  await setBlobMetadata(blobClient, blob.metadata);
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
