// Azure Storage dependency
const {
  ContainerClient
} = require("@azure/storage-blob");

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

// For development environment - include environment variables from .env
require("dotenv").config();

// Azure Storage resource name
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error("Azure Storage accountName not found");

// Azure SDK needs base URL
const baseUrl = `https://${accountName}.blob.core.windows.net`;

// Unique container name
const timeStamp = Date.now();
const containerName = `test`;

async function main() {
  try {
    
    // create container client from DefaultAzureCredential
    const containerClient = new ContainerClient(
      `${baseUrl}/${containerName}`,
      new DefaultAzureCredential()
    );    

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
