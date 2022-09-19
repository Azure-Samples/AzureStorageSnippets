// connect-with-connection-string.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function main(){
  
  const containerName = 'REPLACE-WITH-EXISTING-CONTAINER-NAME';
  const blobName = 'REPLACE-WITH-EXISTING-BLOB-NAME';

  const timestamp = Date.now();
  const fileName = `my-new-file-${timestamp}.txt`;

  // creating container client
  const containerClient = await blobServiceClient.getContainerClient(containerName);

  const blobClient = await containerClient.getBlockBlobClient(blobName);
  const blobFile = blobClient.downloadToFile(fileName)

  console.log(`${fileName} downloaded`);
  
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));