// create-container.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

async function createContainer(blobServiceClient, containerName){

  // public access at container level
  const options = {
    access: 'container'
  };

  // creating client also creates container
  const containerClient = await blobServiceClient.createContainer(containerName, options);
  console.log(`container ${containerName} created`);

  // do something with container
  // ...

  return containerClient;
}

async function createContainerSasForExistingContainer(blobServiceClient, containerName, containerPermissions){

  const containerClient = blobServiceClient.getContainerClient(containerName);

  const exists = await containerClient.exists();

  if (!exists) {
    throw Error(`Storage container ${containerName} doesn't exist.`);
  }


  const sasOptions = {
    containerName: containerClient.containerName,
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + (10*60*1000)),
    permissions: ContainerSASPermissions.parse("racwdl"),
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  return sasToken;
}

async function createBlobSas(blobServiceClient, containerName, containerPermissions, blobName, blobPermissions){

}

async function main(blobServiceClient){

  // create container
  const timestamp = Date.now();
  const containerName = `create-container-${timestamp}`;
  console.log(`creating container ${containerName}`);

  // create containers
  await createContainer(blobServiceClient, containerName);

  // only 1 $root per blob storage resource
  const containerRootName = '$root';

  // create root container
  await createContainer(blobServiceClient, containerRootName);

}
main(client)
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
