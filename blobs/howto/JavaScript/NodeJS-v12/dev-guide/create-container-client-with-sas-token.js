// Azure Storage dependency
const {
  ContainerClient
} = require("@azure/storage-blob");

// For development environment - include environment variables
require("dotenv").config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error("Azure Storage accountName not found");

// Container must exist prior to running this script
const containerName = `test`;

// SAS token must have LIST permissions on container that haven't expired
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;

// Create SAS URL
const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;

async function main() {
  try {
    // create container client from SAS token
    const containerClient = new ContainerClient(sasUrl);

    // do something with containerClient...
    let i = 1;

    // List blobs in container
    for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`Blob ${i++}: ${blob.name}`);
    }   
    
  } catch (err) {
    console.log(err);
    throw err;
  }
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
