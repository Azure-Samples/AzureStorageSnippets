// delete-containers.js
import {
  BlobServiceClient,
  ContainerClient,
  ContainerCreateOptions,
  ContainerDeleteMethodOptions,
  ContainerDeleteResponse,
  ContainerGetPropertiesOptions,
  ContainerGetPropertiesResponse,
  ContainerUndeleteResponse,
  ServiceListContainersOptions,
  ServiceUndeleteContainerOptions
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// soft delete may take up to 30 seconds
const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

// <snippet_delete_container_immediately>
async function deleteContainer(
  blobServiceClient: BlobServiceClient,
  containerName: string
): Promise<ContainerDeleteResponse> {
  return await blobServiceClient.deleteContainer(containerName);
}
// </snippet_delete_container_immediately>

// <snippet_delete_container_soft_delete>
// soft delete container on ContainerClient
async function deleteContainerSoft(
  containerClient: ContainerClient
): Promise<ContainerDeleteResponse> {
  return await containerClient.delete();
}
// </snippet_delete_container_soft_delete>

// <snippet_deleteContainersWithPrefix>
async function deleteContainersWithPrefix(
  blobServiceClient: BlobServiceClient,
  prefix: string
): Promise<void> {
  const containerOptions: ServiceListContainersOptions = {
    includeDeleted: false,
    includeMetadata: false,
    includeSystem: true,
    prefix
  };

  for await (const containerItem of blobServiceClient.listContainers(
    containerOptions
  )) {
    try {
      const containerClient: ContainerClient =
        blobServiceClient.getContainerClient(containerItem.name);

      const containerDeleteMethodOptions: ContainerDeleteMethodOptions = {};

      await containerClient.delete(containerDeleteMethodOptions);

      console.log(`Deleted ${containerItem.name} container - success`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(
          `Deleted ${containerItem.name} container - failed - ${err.message}`
        );
      }
    }
  }
}
// </snippet_deleteContainersWithPrefix>

// Undelete specific container - last version
// <snippet_undeleteContainer>
async function undeleteContainer(
  blobServiceClient: BlobServiceClient,
  containerName: string
): Promise<void> {
  // version to undelete
  let containerVersion: string | undefined;

  const containerOptions: ServiceListContainersOptions = {
    includeDeleted: true,
    prefix: containerName
  };

  // Find the deleted container and restore it
  for await (const containerItem of blobServiceClient.listContainers(
    containerOptions
  )) {
    if (containerItem.name === containerName) {
      containerVersion = containerItem.version as string;
    }
  }

  if (containerVersion !== undefined) {
    const serviceUndeleteContainerOptions: ServiceUndeleteContainerOptions = {};

    const {
      containerClient,
      containerUndeleteResponse
    }: {
      containerClient: ContainerClient;
      containerUndeleteResponse: ContainerUndeleteResponse;
    } = await blobServiceClient.undeleteContainer(
      containerName,
      containerVersion,
      serviceUndeleteContainerOptions
    );
  }
}
// </snippet_undeleteContainer>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {

  const containerName = 'delete2';

  await deleteContainer(blobServiceClient, containerName);

  // soft delete container with ContainerClient
  //const containerClient: ContainerClient = blobServiceClient.getContainerClient(
  //  'sample-container'
  //);
  //await deleteContainerSoft(containerClient);

  // delete with prefix and not already deleted
  await deleteContainersWithPrefix(blobServiceClient, 'sample-');

  await sleep(30000);

  // undelete container
  await undeleteContainer(blobServiceClient, 'sample-container');
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
