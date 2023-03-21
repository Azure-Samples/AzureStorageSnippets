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
// delete container immediately on blobServiceClient
async function deleteContainerImmediately(
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
    // only delete containers not deleted
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

      console.log(`deleted ${containerItem.name} container - success`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(
          `deleted ${containerItem.name} container - failed - ${err.message}`
        );
      }
    }
  }
}
// </snippet_deleteContainersWithPrefix>

// <snippet_undeleteContainer>
// Undelete specific container - last version
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

  // container listing returns version (timestamp) in the ContainerItem
  for await (const containerItem of blobServiceClient.listContainers(
    containerOptions
  )) {
    // if there are multiple deleted versions of the same container,
    // the versions are in asc time order
    // the last version is the most recent
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

      // optional/new container name - if unused, original container name is used
      //newContainerName
      serviceUndeleteContainerOptions
    );

    // Check delete
    if (containerUndeleteResponse.errorCode)
      throw Error(containerUndeleteResponse.errorCode);

    // undelete was successful
    console.log(`${containerName} is undeleted`);

    // do something with containerClient
    // ...
    // containerClient.listBlobsFlat({    includeMetadata: true,
    // includeSnapshots: false,
    // includeTags: true,
    // includeVersions: false,
    // prefix: ''});
  }
}
// </snippet_undeleteContainer>
async function createContainer(
  blobServiceClient: BlobServiceClient,
  containerName: string
): Promise<void> {
  // public access at container level
  const containerCreateOptions: ContainerCreateOptions = {
    access: 'container'
  };

  // creating client also creates container
  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(
      containerName,
      containerCreateOptions
    );

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  const containerGetPropertiesOptions: ContainerGetPropertiesOptions = {};

  // list container properties
  const containerProperties: ContainerGetPropertiesResponse =
    await containerClient.getProperties(containerGetPropertiesOptions);
  if (!containerProperties.errorCode) {
    console.log(
      `${containerName} lastModified: ${containerProperties.lastModified}`
    );
  }
}

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  const length = 9;
  const pContainers: Promise<void>[] = new Array(length);

  const timestamp = Date.now();
  const containerName = `create-container-${timestamp}`;

  // create containers with Promise.all
  for (let i = 1; i < length; i++) {
    pContainers.push(
      createContainer(blobServiceClient, `${containerName}-${i}`)
    );
  }
  await Promise.all(pContainers);

  // delete 1 container immediately with BlobServiceClient
  await deleteContainerImmediately(blobServiceClient, `${containerName}-1`);

  // soft deletes take 30 seconds - waiting now so that undelete won't throw error
  await sleep(30000);

  // soft delete container with ContainerClient
  const containerClient: ContainerClient = blobServiceClient.getContainerClient(
    `${containerName}-2`
  );

  await deleteContainerSoft(containerClient);

  // delete with prefix and not already deleted
  await deleteContainersWithPrefix(blobServiceClient, `${containerName}`);

  // undelete container
  await undeleteContainer(blobServiceClient, `${containerName}-1`);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
