import {
  BlobGetPropertiesOptions,
  BlobGetPropertiesResponse,
  BlobItem,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// Add extended properties to BlobItem
type BlobWithProperties = BlobItem & {
  extendedProperties: BlobGetPropertiesResponse;
};

// Get all of the blob's properties, metadata, tags, etc
export async function getContainerListOfBlobsProperties(
  containerClient: ContainerClient,
  blobPrefix: string // empty string means no prefix === all blobs
): Promise<BlobWithProperties[]> {
  const blobWithProperties: BlobWithProperties[] = [];

  for await (const blobItem of containerClient.listBlobsFlat({
    includeMetadata: true,
    includeSnapshots: true,
    includeTags: true,
    includeVersions: true,
    prefix: blobPrefix
  })) {
    // Get BlobClient
    const blockBlobClient: BlockBlobClient =
      await containerClient.getBlockBlobClient(blobItem.name);

    // Properties options
    const options: BlobGetPropertiesOptions = {
      abortSignal: undefined,
      conditions: undefined,
      customerProvidedKey: undefined
    };

    // Properties
    const blobGetPropertiesResponse: BlobGetPropertiesResponse =
      await blockBlobClient.getProperties(options);

    // Add properties to blobItem
    if (!blobGetPropertiesResponse.errorCode) {
      // blobItem.properties doesn't have as much information as blobGetPropertiesResponse
      blobWithProperties.push({
        ...blobItem,
        extendedProperties: blobGetPropertiesResponse
      });
    }
  }
  return blobWithProperties;
}
async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  // Container should have blobs in it
  const containerName = 'my-container';

  // Set prefix of blob names is you want to filter
  const blobPrefix = '';

  const containerClient: ContainerClient =
    await blobServiceClient.getContainerClient(containerName);

  // Get custom metadata, custom tags, and system properties
  const listBlobsWithProperties = await getContainerListOfBlobsProperties(
    containerClient,
    blobPrefix
  );
  console.log(listBlobsWithProperties);
}
main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
/*
  blobProperties: BlobGetPropertiesResponse 

  {
    "lastModified": "2023-03-14T21:20:42.000Z",
    "createdOn": "2023-03-14T21:00:29.000Z",
    "metadata": {},
    "objectReplicationRules": {},
    "blobType": "BlockBlob",
    "leaseState": "available",
    "leaseStatus": "unlocked",
    "contentLength": 12,
    "contentType": "application/octet-stream",
    "etag": "\"0x8DB24D1F78ADBB1\"",
    "contentMD5": {
        "type": "Buffer",
        "data": []
    },
    "clientRequestId": "365c7e06-e132-467d-8409-ad94fed1d3e6",
    "requestId": "e4d10d99-501e-0048-791f-583b8e000000",
    "version": "2021-12-02",
    "date": "2023-03-16T15:56:00.000Z",
    "acceptRanges": "bytes",
    "isServerEncrypted": true,
    "accessTier": "Hot",
    "accessTierInferred": true,
    "body": true,
    "_response": {...},
    "objectReplicationSourceProperties": []
}
*/
