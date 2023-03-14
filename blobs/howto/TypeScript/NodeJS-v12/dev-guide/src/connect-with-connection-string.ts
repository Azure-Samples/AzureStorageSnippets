// connect-with-connection-string.js
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

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
