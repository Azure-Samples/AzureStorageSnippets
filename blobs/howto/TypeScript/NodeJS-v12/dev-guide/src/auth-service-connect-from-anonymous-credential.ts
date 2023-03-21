// connect-with-anonymous-credential.js
// Requires public access to service, container and blob
import { AnonymousCredential, BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('Azure Storage accountName not found');

const blobServiceUri = `https://${accountName}.blob.core.windows.net`;

const blobServiceClient = new BlobServiceClient(
  blobServiceUri,
  new AnonymousCredential()
);

async function getContainerProperties() {
  const containerName = 'my-container';
  const blobName = 'my-blob';

  const timestamp = Date.now();
  const fileName = `my-new-file-${timestamp}.txt`;

  // create container client
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );

  // create blob client
  const blobClient = await containerClient.getBlockBlobClient(blobName);

  // download file
  const downloadResult = await blobClient.downloadToFile(fileName);

  if (downloadResult.errorCode) throw Error(downloadResult.errorCode);

  console.log(
    `${fileName} downloaded ${downloadResult.contentType}, isCurrentVersion: ${downloadResult.isCurrentVersion}`
  );
}

getContainerProperties()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
