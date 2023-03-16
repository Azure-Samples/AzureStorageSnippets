import {
  BlobServiceClient,
  BlockBlobUploadOptions,
  BlobGetPropertiesResponse,
  Metadata,
  BlobClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

/*
metadata= {
    reviewedBy: 'Bob',
    releasedBy: 'Jill',
}
*/
async function setBlobMetadata(blobClient: BlobClient, metadata: Metadata) {
  await blobClient.setMetadata(metadata);

  console.log(`metadata set successfully`);
}
/*
properties= {
      blobContentType: 'text/plain',
      blobContentLanguage: 'en-us',
      blobContentEncoding: 'utf-8',
      // all other http properties are cleared
    }
*/
async function setHTTPHeaders(blobClient: BlobClient, headers) {
  await blobClient.setHTTPHeaders(headers);

  console.log(`headers set successfully`);
}

async function getProperties(blobClient: BlobClient) {
  const properties: BlobGetPropertiesResponse =
    await blobClient.getProperties();
  console.log(blobClient.name + ' properties: ');

  for (const property in properties) {
    switch (property) {
      // nested properties are stringified and returned as strings
      case 'metadata':
      case 'objectReplicationRules':
        console.log(`    ${property}: ${JSON.stringify(properties[property])}`);
        break;
      default:
        console.log(`    ${property}: ${properties[property]}`);
        break;
    }
  }
}

// containerName: string
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
async function createBlobFromString(
  client,
  blobName,
  fileContentsAsString,
  uploadOptions: BlockBlobUploadOptions | undefined
) {
  // Create blob client from container client
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  console.log(`uploading blob ${blobName}`);

  // Upload string
  await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    uploadOptions
  );

  // do something with blob
  // ...
  return blockBlobClient;
}
async function main(blobServiceClient) {
  // create container
  const timestamp = Date.now();
  const containerName = `blob-set-properties-and-metadata-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(
    containerName,
    containerOptions
  );

  console.log('container creation succeeded');

  // create blob
  const blob = {
    name: `my-blob.txt`,
    text: `Hello from a string`,
    // indexed for searching
    properties: {
      blobContentType: 'text/plain',
      blobContentLanguage: 'en-us',
      blobContentEncoding: 'utf-8'
    },
    metadata: {
      reviewedBy: 'Bob',
      releasedBy: 'Jill'
    }
  };

  const options = undefined;

  const blobClient = await createBlobFromString(
    containerClient,
    blob.name,
    blob.text,
    options
  );

  await setBlobMetadata(blobClient, blob.metadata);
  await setHTTPHeaders(blobClient, blob.properties);
  await getProperties(blobClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
