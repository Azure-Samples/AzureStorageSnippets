// connect-with-account-name-and-key.js
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
require('dotenv').config()

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

async function main() {

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
  .catch((ex) => console.log(ex.message));