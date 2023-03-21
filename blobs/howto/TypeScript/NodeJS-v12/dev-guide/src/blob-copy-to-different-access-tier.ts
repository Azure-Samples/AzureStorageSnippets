import {
  BlobBeginCopyFromURLOptions,
  BlobClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { getContainerClientFromSharedKeyCredential } from './auth-get-client';
dotenv.config();

// Set names
const containerName = `my-container`;
const originalBlob = `my-blob`;
const copyBlob = `my-blob-copy`;

const containerClient: ContainerClient =
  getContainerClientFromSharedKeyCredential(containerName);

//<Snippet_CopyWithAccessTier>
async function copyBlobWithDifferentAccessTier(
  containerClient: ContainerClient
): Promise<void> {
  // create blob clients
  const sourceBlobClient: BlobClient = await containerClient.getBlobClient(
    originalBlob
  );
  const destinationBlobClient: BlobClient = await containerClient.getBlobClient(
    copyBlob
  );

  const copyOptions: BlobBeginCopyFromURLOptions = { tier: 'Hot' };

  // start copy, access tiers include `Hot`, `Cool`, `Archive`
  const copyPoller = await destinationBlobClient.beginCopyFromURL(
    sourceBlobClient.url,
    copyOptions
  );
  console.log('start copy from original to copy');

  // wait until done
  await copyPoller.pollUntilDone();
  console.log('copy finished');
}
//</Snippet_CopyWithAccessTier>
copyBlobWithDifferentAccessTier(containerClient)
  .then(() => console.log('success'))
  // Error message for blob currently in rehydration process:
  // `There is currently a pending copy operation.`
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
