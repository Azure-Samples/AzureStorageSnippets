// index.js
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
  const serviceGetPropertiesResponse = await blobServiceClient.getProperties();
  console.log(`${JSON.stringify(serviceGetPropertiesResponse)}`);
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error: ${ex.message}`));