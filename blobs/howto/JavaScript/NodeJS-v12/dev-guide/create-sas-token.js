// create-container.js
const { BlobServiceClient, StorageSharedKeyCredential, ContainerSASPermissions, SASProtocol, generateBlobSASQueryParameters } = require('@azure/storage-blob');
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

// https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob/?view=azure-node-latest#@azure-storage-blob-generateblobsasqueryparameters
async function createContainerSas(blobServiceClient, containerName){

  const containerClient = blobServiceClient.getContainerClient(containerName);

  const sasOptions = {
    containerName: containerClient.containerName,
    //blobName: blobName,
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + (10*60*1000)), // 10 minutes
    permissions: ContainerSASPermissions.parse("racwdl"),
    protocol: SASProtocol.HttpsAndHttp, // Optional
    //cacheControl: "cache-control-override", // Optional
    //contentDisposition: "content-disposition-override", // Optional
    //contentEncoding: "content-encoding-override", // Optional
    //contentLanguage: "content-language-override", // Optional
    //contentType: "content-type-override", // Optional    
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  return sasToken;

}

async function main(blobServiceClient){

  // create container
  const timestamp = Date.now();
  const containerName = `create-sas-for-container-${timestamp}`;
  console.log(`creating container ${containerName}`);

  // create containers
  return await createContainerSas(blobServiceClient, containerName);

}
main(blobServiceClient)
.then((sasToken) => console.log(sasToken))
.catch((ex) => console.log(ex.message));
