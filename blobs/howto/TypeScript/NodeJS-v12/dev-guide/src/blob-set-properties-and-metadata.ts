import {
  BlobClient,
  BlobGetPropertiesResponse,
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadOptions,
  ContainerCreateOptions,
  Metadata
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <snippet_setBlobMetadata>
async function setBlobMetadata(
  blobClient: BlobClient,
  metadata: Metadata
): Promise<void> {
  /*
    metadata= {
        reviewedBy: 'Bob',
        releasedBy: 'Jill',
    }
*/
  const metadataResults = await blobClient.setMetadata(metadata);

  if (!metadataResults.errorCode) {
    console.log(`metadata set successfully ${metadataResults.date}`);
  }
}
// </snippet_setBlobMetadata>

// <snippet_setHTTPHeaders>
async function setHTTPHeaders(blobClient: BlobClient, headers): Promise<void> {
  /*
  headers= {
      blobContentType: 'text/plain',
      blobContentLanguage: 'en-us',
      blobContentEncoding: 'utf-8',
      // all other http properties are cleared
    }
  */

  const headerResults = await blobClient.setHTTPHeaders(headers);

  if (!headerResults.errorCode) {
    console.log(`headers set successfully ${headerResults.date}`);
  }
}
// </snippet_setHTTPHeaders>

// <snippet_getProperties>
async function getProperties(blobClient: BlobClient): Promise<void> {
  const propertiesResponse: BlobGetPropertiesResponse =
    await blobClient.getProperties();

  if (!propertiesResponse.errorCode) {
    console.log(blobClient.name + ' properties: ');

    for (const property in propertiesResponse) {
      switch (property) {
        // nested properties are stringified and returned as strings
        case 'metadata':
        case 'objectReplicationRules':
          console.log(
            `    ${property}: ${JSON.stringify(propertiesResponse[property])}`
          );
          break;
        default:
          console.log(`    ${property}: ${propertiesResponse[property]}`);
          break;
      }
    }
  }
}
// </snippet_getProperties>

/*
my-blob.txt properties:
    lastModified: Mon Mar 20 2023 11:04:17 GMT-0700 (Pacific Daylight Time)
    createdOn: Mon Mar 20 2023 11:04:17 GMT-0700 (Pacific Daylight Time)
    metadata: {"releasedby":"Jill","reviewedby":"Bob"}
    objectReplicationPolicyId: undefined
    objectReplicationRules: {}
    blobType: BlockBlob
    copyCompletedOn: undefined
    copyStatusDescription: undefined
    copyId: undefined
    copyProgress: undefined
    copySource: undefined
    copyStatus: undefined
    isIncrementalCopy: undefined
    destinationSnapshot: undefined
    leaseDuration: undefined
    leaseState: available
    leaseStatus: unlocked
    contentLength: 19
    contentType: text/plain
    etag: "0x8DB296D85EED062"
    contentMD5: undefined
    isServerEncrypted: true
    encryptionKeySha256: undefined
    encryptionScope: undefined
    accessTier: Hot
    accessTierInferred: true
    archiveStatus: undefined
    accessTierChangedOn: undefined
    versionId: undefined
    isCurrentVersion: undefined
    tagCount: undefined
    expiresOn: undefined
    isSealed: undefined
    rehydratePriority: undefined
    lastAccessed: undefined
    immutabilityPolicyExpiresOn: undefined
    immutabilityPolicyMode: undefined
    legalHold: undefined
    errorCode: undefined
    body: true
    _response: [object Object]
    objectReplicationDestinationPolicyId: undefined
    objectReplicationSourceProperties:
*/

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

  const options: BlockBlobUploadOptions | undefined = undefined;

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
