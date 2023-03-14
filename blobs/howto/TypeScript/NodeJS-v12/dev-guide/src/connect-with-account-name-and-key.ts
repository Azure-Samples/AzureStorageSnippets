// connect-with-account-name-and-key.js
import {
  BlobServiceClient,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
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

async function main() {
  const containerName = 'REPLACE-WITH-EXISTING-CONTAINER-NAME';
  const blobName = 'REPLACE-WITH-EXISTING-BLOB-NAME';

  const timestamp = Date.now();
  const fileName = `my-new-file-${timestamp}.txt`;

  // create container client
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );

  // create blob client
  const blobClient = await containerClient.getBlockBlobClient(blobName);

  // download file
  await blobClient.downloadToFile(fileName);

  console.log(`${fileName} downloaded`);
}

main()
  .then(() => console.log(`done`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
