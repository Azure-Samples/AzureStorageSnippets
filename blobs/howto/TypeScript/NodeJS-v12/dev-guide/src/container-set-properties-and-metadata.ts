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
  try {
    const containerProperties: ContainerGetPropertiesResponse =
      await containerClient.getProperties();

      console.log(`Public access type: ${containerProperties.blobPublicAccess}`);
      console.log(`Lease status: ${containerProperties.leaseStatus}`);
      console.log(`Lease state: ${containerProperties.leaseState}`);
      console.log(`Has immutability policy: ${containerProperties.hasImmutabilityPolicy}`);
  } catch (err) {
    // Handle the error
  }
}
// </snippet_getContainerProperties>

// <snippet_setContainerMetadata>
async function setContainerMetadata(
  containerClient: ContainerClient,
) {
  try {
    const metadata = {
      // values must be strings
      lastFileReview: "currentDate",
      reviewer: "reviewerName"
    };
    await containerClient.setMetadata(metadata);
  }
  catch (err) {
    // Handle the error
  }
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

  await setContainerMetadata(containerClient);

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
