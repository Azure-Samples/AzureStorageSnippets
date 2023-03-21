// Azure Storage dependency
import {
  BlobClient,
  BlobDownloadHeaders,
  BlobGetPropertiesHeaders,
  BlobGetPropertiesResponse,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';

// For development environment - include environment variables from .env
import * as dotenv from 'dotenv';
import { getContainerClientFromDefaultAzureCredential } from './auth-get-client';
dotenv.config();

const containerName = `my-container`;
const containerClient: ContainerClient =
  getContainerClientFromDefaultAzureCredential(containerName);

const blobName = `my-blob`;

async function main(containerClient: ContainerClient): Promise<void> {
  // Create BlobClient object
  const blobClient: BlobClient = containerClient.getBlobClient(blobName);

  // do something with blobClient...
  const properties: BlobGetPropertiesHeaders = await blobClient.getProperties();
  if (properties.errorCode) throw Error(properties.errorCode);

  console.log(`Blob ${blobName} properties:`);

  // get BlockBlobClient from blobClient
  const blockBlobClient: BlockBlobClient = blobClient.getBlockBlobClient();

  // do something with blockBlobClient...
  const downloadResponse: BlobDownloadHeaders = await blockBlobClient.download(
    0
  );
  if (downloadResponse.errorCode) throw Error(downloadResponse.errorCode);
}

main(containerClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
