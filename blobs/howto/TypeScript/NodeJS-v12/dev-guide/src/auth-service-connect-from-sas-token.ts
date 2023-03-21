// connect-with-sas-token.js
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!sasToken) throw Error('Azure Storage accountKey not found');

// https://YOUR-RESOURCE-NAME.blob.core.windows.net?YOUR-SAS-TOKEN
const blobServiceUri = `https://${accountName}.blob.core.windows.net?${sasToken}`;

// SAS tokens do not require an additional credential because
// the token is the credential
const credential = undefined;

const blobServiceClient = new BlobServiceClient(blobServiceUri, credential);

async function main() {
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

main()
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
