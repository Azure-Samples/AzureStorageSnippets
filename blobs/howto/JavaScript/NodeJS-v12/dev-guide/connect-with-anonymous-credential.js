// index.js
const { BlobServiceClient, AnonymousCredential } = require('@azure/storage-blob');
require('dotenv').config()

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!sasToken) throw Error('Azure Storage accountKey not found');

const blobServiceUri = `https://${accountName}.blob.core.windows.net${sasToken}`;

const blobServiceClient = new BlobServiceClient(
  blobServiceUri,
  new AnonymousCredential()
);

async function main(){
  const serviceGetPropertiesResponse = await blobServiceClient.getProperties();
  console.log(`${JSON.stringify(serviceGetPropertiesResponse)}`);
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error: ${ex.message}`));