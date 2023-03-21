// connect-with-connection-string.js
import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function main(): Promise<void> {
  const containerName = 'my-container';
  const blobName = 'my-blob';

  const timestamp = Date.now();
  const fileName = `my-new-file-${timestamp}.txt`;

  // create container client
  const containerClient: ContainerClient =
    await blobServiceClient.getContainerClient(containerName);

  // create blob client
  const blobClient: BlockBlobClient = await containerClient.getBlockBlobClient(
    blobName
  );

  // download file
  const downloadResult = await blobClient.downloadToFile(fileName);

  if (downloadResult.errorCode) throw Error(downloadResult.errorCode);

  console.log(`${fileName} download created on ${downloadResult.createdOn}`);
}

main()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
