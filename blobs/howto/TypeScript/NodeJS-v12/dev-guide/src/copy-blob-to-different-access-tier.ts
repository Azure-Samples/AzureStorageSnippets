import * as dotenv from 'dotenv';
dotenv.config();
import {
  StorageSharedKeyCredential,
  ContainerClient
} from '@azure/storage-blob';

// Credential secrets
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('AZURE_STORAGE_ACCOUNT_NAME not found');

const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
if (!accountKey) throw Error('AZURE_STORAGE_ACCOUNT_KEY not found');

// Create credential
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

// Set resource names
const containerName = `my-container`;
const originalBlob = `my-blob`;
const copyBlob = `my-blob-copy`;
const baseUrl = `https://${accountName}.blob.core.windows.net`;

// create container client
// assumes same container
const containerClient = new ContainerClient(
  `${baseUrl}/${containerName}`,
  sharedKeyCredential
);
//<Snippet_CopyWithAccessTier>
async function copyBlobWithDifferentAccessTier(containerClient) {
  // create blob clients
  const sourceBlobClient = await containerClient.getBlobClient(originalBlob);
  const destinationBlobClient = await containerClient.getBlobClient(copyBlob);

  // start copy, access tiers include `Hot`, `Cool`, `Archive`
  const copyPoller = await destinationBlobClient.beginCopyFromURL(
    sourceBlobClient.url,
    { tier: 'Hot' }
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
