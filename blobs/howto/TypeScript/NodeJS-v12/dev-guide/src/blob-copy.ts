import {
  BlobClient,
  BlobServiceClient,
  ContainerClient,
  ContainerCreateOptions
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function createBlobFromString(
  blobServiceClient: BlobServiceClient,
  containerName: string,
  blobName: string,
  blobContent: string
) {
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // upload blob
  const uploadResult = await blockBlobClient.upload(
    blobContent,
    blobContent.length
  );
  if (!uploadResult.errorCode) {
    console.log(`created blob ${blobName} ${uploadResult.date}`);
  }
}
// <snippet_copyBlob>
async function copyBlob(
  blobServiceClient: BlobServiceClient,
  sourceBlobContainer: string,
  sourceBlobName: string,
  destinationBlobContainer: string,
  destinationBlobName: string
) {
  // create container clients
  const sourceContainerClient: ContainerClient =
    blobServiceClient.getContainerClient(sourceBlobContainer);
  const destinationContainerClient: ContainerClient =
    blobServiceClient.getContainerClient(destinationBlobContainer);

  // create blob clients
  const sourceBlobClient = await sourceContainerClient.getBlobClient(
    sourceBlobName
  );
  const destinationBlobClient = await destinationContainerClient.getBlobClient(
    destinationBlobName
  );

  // start copy
  const copyPoller = await destinationBlobClient.beginCopyFromURL(
    sourceBlobClient.url
  );
  console.log('start copy from A to B');

  // wait until done
  await copyPoller.pollUntilDone();
}
// </snippet_copyBlob>
// <copyThenAbortBlob>
async function copyThenAbortBlob(
  blobServiceClient: BlobServiceClient,
  sourceBlobContainer: string,
  sourceBlobName: string,
  destinationBlobContainer: string,
  destinationBlobName: string
) {
  // create container clients
  const sourceContainerClient: ContainerClient =
    blobServiceClient.getContainerClient(sourceBlobContainer);
  const destinationContainerClient: ContainerClient =
    blobServiceClient.getContainerClient(destinationBlobContainer);

  // create blob clients
  const sourceBlobClient: BlobClient =
    await sourceContainerClient.getBlobClient(sourceBlobName);
  const destinationBlobClient: BlobClient =
    await destinationContainerClient.getBlobClient(destinationBlobName);

  // start copy
  const copyPoller = await destinationBlobClient.beginCopyFromURL(
    sourceBlobClient.url
  );
  console.log('start copy from A to C');

  // cancel operation after starting it -
  // sample file may be too small to be canceled.
  try {
    await copyPoller.cancelOperation();
    console.log('request to cancel copy from A to C');

    // calls to get the result now throw PollerCancelledError
    await copyPoller.getResult();
  } catch (err: unknown) {
    if (err instanceof Error && err?.name === 'PollerCancelledError') {
      console.log('The copy was cancelled.');
    }
  }
}
// </copyThenAbortBlob>
async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  // create container
  const timestamp = Date.now();
  const containerNameA = `copy-blob-a-${timestamp}`;
  const containerNameB = `copy-blob-b-${timestamp}`;

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };

  await blobServiceClient.createContainer(containerNameA, containerOptions);
  console.log(`created container ${containerNameA}`);

  await blobServiceClient.createContainer(containerNameB, containerOptions);
  console.log(`created container ${containerNameB}`);

  const blobNameA = `a-from-string.txt`;
  const blobNameB = `b-from-string.txt`;
  const blobNameC = `c-from-string.txt`;
  const blobContent = `Hello from a string`;

  // create blob from string
  await createBlobFromString(
    blobServiceClient,
    containerNameA,
    blobNameA,
    blobContent
  );

  // copy blob A to B
  await copyBlob(
    blobServiceClient,
    containerNameA,
    blobNameA,
    containerNameB,
    blobNameB
  );

  // copy blob A to C then abort
  await copyThenAbortBlob(
    blobServiceClient,
    containerNameA,
    blobNameA,
    containerNameB,
    blobNameC
  );
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
