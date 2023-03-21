import {
  BlobServiceClient,
  ContainerClient,
  ContainerCreateOptions,
  ContainerCreateResponse,
  ContainerGetPropertiesResponse,
  Metadata
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <snippet_getContainerProperties>
async function getContainerProperties(
  containerClient: ContainerClient
): Promise<void> {
  const properties: ContainerGetPropertiesResponse =
    await containerClient.getProperties();

  if (properties.errorCode) throw Error(properties.errorCode);

  console.log(containerClient.containerName + ' properties: ');

  for (const property in properties) {
    switch (property) {
      // nested properties are stringified
      case 'metadata':
        //case 'objectReplicationRules':
        console.log(`    ${property}: ${JSON.stringify(properties[property])}`);
        break;
      default:
        console.log(`    ${property}: ${properties[property]}`);
        break;
    }
  }
}
/* Example output: 
{
    "metadata": {
        "lastfilereview": "3/20/2023",
        "reviewer": "johnh"
    },
    "etag": "\"0x8DB295348CDCD54\"",
    "lastModified": "2023-03-20T14:56:28.000Z",
    "leaseState": "available",
    "leaseStatus": "unlocked",
    "clientRequestId": "0bc8c31a-c607-477e-9846-f2121b10297a",
    "requestId": "1e4ee737-b01e-0042-4e3c-5b2207000000",
    "version": "2021-12-02",
    "date": "2023-03-20T14:56:28.000Z",
    "blobPublicAccess": "container",
    "hasImmutabilityPolicy": false,
    "hasLegalHold": false,
    "defaultEncryptionScope": "$account-encryption-key",
    "denyEncryptionScopeOverride": false,
    "isImmutableStorageWithVersioningEnabled": false
}
*/
// </snippet_getContainerProperties>
// <snippet_setContainerMetadata>
/*
const metadata = {
  // values must be strings
  lastFileReview: currentDate.toString(),
  reviewer: `johnh`
}
*/
async function setContainerMetadata(
  containerClient: ContainerClient,
  metadata: Metadata
) {
  await containerClient.setMetadata(metadata);
}
// </snippet_setContainerMetadata>
async function main(blobServiceClient: BlobServiceClient) {
  // create container
  const timestamp = Date.now();
  const containerName = `container-set-properties-and-metadata-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const {
    containerClient,
    containerCreateResponse
  }: {
    containerClient: ContainerClient;
    containerCreateResponse: ContainerCreateResponse;
  } = await blobServiceClient.createContainer(containerName, containerOptions);

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  console.log('container creation succeeded');

  const currentDate = new Date().toLocaleDateString();

  const containerMetadata: Metadata = {
    // values must be strings
    lastFileReview: currentDate,
    reviewer: `johnh`
  };

  await setContainerMetadata(containerClient, containerMetadata);

  // properties including metadata
  await getContainerProperties(containerClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
