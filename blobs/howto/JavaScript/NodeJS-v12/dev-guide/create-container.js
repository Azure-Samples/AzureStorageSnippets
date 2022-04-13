const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createContainer(client, containerName){
  console.log(`creating ${containerName}`);
  const { containerClient, result } = await client.createContainer(containerName);
}

async function main(blobServiceClient){

  let containers = [];

  // container name prefix must be unique
  const containerName = "blob-storage-dev-guide";

  // create 10 containers with Promise.all
  for (let i=0; i<10; i++){
    containers.push(createContainer(blobServiceClient, `${containerName}-${i}`));
  }
  await Promise.all(containers);

  // only 1 $root per blob storage resource
  const containerRootName = "$root";

  // create root container
  console.log(`creating ${containerRootName}`);
  const { containerClient, result } = await blobServiceClient.createContainer(containerRootName);

}
main(client)
.then(() => console.log("done"))
.catch((ex) => console.log(ex.message));
