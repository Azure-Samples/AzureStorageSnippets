// connect-with-connection-string.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

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
  .catch((ex) => console.log(ex.message));