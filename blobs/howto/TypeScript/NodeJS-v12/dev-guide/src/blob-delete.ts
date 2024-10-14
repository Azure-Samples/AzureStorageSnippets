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

// <snippet_deleteBlob>
async function deleteBlob(
  containerClient: ContainerClient,
  blobName
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  // include: Delete the base blob and all of its snapshots
  // only: Delete only the blob's snapshots and not the blob itself
  const options: BlobDeleteOptions = {
    deleteSnapshots: 'include'
  };
  const blobDeleteResponse: BlobDeleteResponse = 
    await blockBlobClient.delete(options);
}
// </snippet_deleteBlob>
// <snippet_deleteBlobIfExists>
async function deleteBlobIfItExists(
  containerClient: ContainerClient,
  blobName
): Promise<void> {
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
// </snippet_deleteBlobIfExists>
// <snippet_undeleteBlob>
async function undeleteBlob(
  containerClient: ContainerClient,
  blobName
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  const options: BlobUndeleteOptions = {};
  const blobUndeleteResponse: BlobUndeleteResponse =
    await blockBlobClient.undelete(options);
}
// </snippet_undeleteBlob>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {

  const containerClient: ContainerClient = blobServiceClient.getContainerClient('sample-container');

  // delete blob
  await deleteBlob(containerClient, 'sample-blob.txt');

  // delete blob if it exists
  //await deleteBlobIfItExists(containerClient, 'sample-blob.txt');

  // sleep for 30 seconds to allow the blob to be deleted
  await new Promise(resolve => setTimeout(resolve, 30000));
  // restore deleted blob
  await undeleteBlob(containerClient, 'sample-blob.txt');
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
