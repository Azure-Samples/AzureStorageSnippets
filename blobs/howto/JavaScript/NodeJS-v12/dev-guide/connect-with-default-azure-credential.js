// connect-with-default-azure-credential.js
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config()

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('Azure Storage accountName not found');

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
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