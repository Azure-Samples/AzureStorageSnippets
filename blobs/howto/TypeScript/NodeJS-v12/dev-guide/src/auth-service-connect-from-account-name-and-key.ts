// connect-with-account-name-and-key.js
import {
  BlobServiceClient,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

async function main(): Promise<void> {
  const containerName = 'my-container';
  const blobName = 'my-blob';

  const timestamp = Date.now();
  const fileName = path.join(
    __dirname,
    '../files',
    `my-new-file-${timestamp}.txt`
  );

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
    `${fileName} downloaded, created on ${downloadResult.createdOn}}`
  );
}

main()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
