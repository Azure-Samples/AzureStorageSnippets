import {
  BlobDeleteIfExistsResponse,
  BlobDeleteOptions,
  BlobDeleteResponse,
  BlobServiceClient,
  BlobUndeleteOptions,
  BlobUndeleteResponse,
  BlockBlobClient,
  BlockBlobUploadOptions,
  ContainerClient,
  ContainerCreateOptions,
  Tags
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function deleteBlob(containerClient: ContainerClient, blobName) {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  // include: Delete the base blob and all of its snapshots.
  // only: Delete only the blob's snapshots and not the blob itself.
  const options: BlobDeleteOptions = {
    deleteSnapshots: 'include' // or 'only'
  };
  const blobDeleteResponse: BlobDeleteResponse = await blockBlobClient.delete(
    options
  );

  if (!blobDeleteResponse.errorCode) {
    console.log(`deleted blob ${blobName}`);
  }
}
async function deleteBlobIfItExists(
  containerClient: ContainerClient,
  blobName
) {
  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // include: Delete the base blob and all of its snapshots.
  // only: Delete only the blob's snapshots and not the blob itself.
  const options: BlobDeleteOptions = {
    deleteSnapshots: 'include' // or 'only'
  };
  const blobDeleteIfExistsResponse: BlobDeleteIfExistsResponse =
    await blockBlobClient.deleteIfExists(options);

  if (!blobDeleteIfExistsResponse.errorCode) {
    console.log(`deleted blob ${blobName}`);
  }
}
async function undeleteBlob(containerClient: ContainerClient, blobName) {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  const options: BlobUndeleteOptions = {};
  const blobUndeleteResponse: BlobUndeleteResponse =
    await blockBlobClient.undelete(options);

  if (!blobUndeleteResponse.errorCode) {
    console.log(`undeleted blob ${blobName}`);
  }
}

// containerName: string
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
async function createBlobFromString(
  client: ContainerClient,
  blobName,
  fileContentsAsString,
  uploadOptions: BlockBlobUploadOptions
) {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = await client.getBlockBlobClient(
    blobName
  );

  console.log(`uploading blob ${blobName}`);

  // Upload string
  await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    uploadOptions
  );

  // do something with blob
  // ...
}

async function main(blobServiceClient: BlobServiceClient) {
  const length = 2;
  const blobs: Promise<void>[] = new Array(length);

  // create container
  const timestamp = Date.now();
  const containerName = `delete-blob-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(
    containerName,
    containerOptions
  );

  console.log('container creation succeeded');

  // create 10 blobs with Promise.all
  for (let i = 0; i < length; i++) {
    const tags: Tags = {
      tag1: 'value1'
    };

    const uploadOptions: BlockBlobUploadOptions = {
      metadata: {
        blobNumber: i.toString()
      },
      tags,
      tier: 'Cool'
    };

    const pCreate = createBlobFromString(
      containerClient,
      `${containerName}-${i}.txt`,
      `Hello from a string ${i}`,
      uploadOptions
    );

    blobs.push(pCreate);
  }
  await Promise.all(blobs);

  // delete blob
  await deleteBlob(containerClient, `${containerName}-0.txt`);

  // delete blob if it exists
  await deleteBlobIfItExists(containerClient, `${containerName}-1.txt`);

  // restore deleted blob
  await undeleteBlob(containerClient, `${containerName}-1.txt`);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
