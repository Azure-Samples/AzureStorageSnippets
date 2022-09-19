// connect-with-sas-token.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!sasToken) throw Error('Azure Storage accountKey not found');

const blobServiceUri = `https://${accountName}.blob.core.windows.net`;

const blobServiceClient = new BlobServiceClient(
  `${blobServiceUri}${sasToken}`,
  null
);

async function main(){
  
  const containerName = `container${Date.now()}`;
  console.log(containerName);

  // public access at container level
  const options = {
    access: 'container'
  };

  // creating client also creates container
  const containerClient = await blobServiceClient.createContainer(containerName, options);
  console.log(`container ${containerName} created`);

  // do something with containerClient
  // ...
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error: ${ex.message}`));