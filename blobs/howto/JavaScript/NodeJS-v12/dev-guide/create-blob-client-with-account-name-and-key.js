const {
  StorageSharedKeyCredential,
  ContainerClient,
  BlockBlobClient,
} = require("@azure/storage-blob");
require("dotenv").config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
if (!accountName) throw Error("Azure Storage accountName not found");
if (!accountKey) throw Error("Azure Storage accountKey not found");

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

const timeStamp = Date.now();
const baseUrl = `https://${accountName}.blob.core.windows.net`;
const containerName = `${timeStamp}-my-container`;
const blobName = `${timeStamp}-my-blob`;

const fileContentsAsString = "Hello there.";

async function main() {
  try {
    // create container from ContainerClient
    const containerClient = new ContainerClient(
      `${baseUrl}/${containerName}`,
      sharedKeyCredential
    );    
    await containerClient.createIfNotExists(containerName);
    console.log(`container ${containerClient.url} created`);

    // create blob from BlockBlobClient
    const blockBlobClient = new BlockBlobClient(
      `${baseUrl}/${containerName}/${blobName}`,
      sharedKeyCredential
    );
    await blockBlobClient.upload(
      fileContentsAsString,
      fileContentsAsString.length
    );
    console.log(`blob ${blockBlobClient.url} created`);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
