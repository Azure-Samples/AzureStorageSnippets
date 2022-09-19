// connect-with-anonymous-credential.js
const { BlobServiceClient, AnonymousCredential } = require('@azure/storage-blob');
require('dotenv').config()

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('Azure Storage accountName not found');

const blobServiceUri = `https://${accountName}.blob.core.windows.net`;

const blobServiceClient = new BlobServiceClient(
  blobServiceUri,
  new AnonymousCredential()
);

async function getContainerProperties(){

  const containerName = 'REPLACE-WITH-EXISTING-CONTAINER-NAME';
  const blobName = 'REPLACE-WITH-EXISTING-BLOB-NAME';

  const timestamp = Date.now();
  const fileName = `my-new-file-${timestamp}.txt`;

  // create container client
  const containerClient = await blobServiceClient.getContainerClient(containerName);

  // create blob client
  const blobClient = await containerClient.getBlockBlobClient(blobName);

  // download file
  await blobClient.downloadToFile(fileName);

  console.log(`${fileName} downloaded`);

}

getContainerProperties()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error: ${ex.message}`));