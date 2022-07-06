const { setLogLevel } = require("@azure/logger");
setLogLevel("info");
const { DefaultAzureCredential } = require("@azure/identity"); 
const { newPipeline, ContainerClient, ContainerSASResourceTypes, AnonymousCredential, BlobServiceClient, generateBlobSASQueryParameters, ContainerSASPermissions, generateAccountSASQueryParameters, AccountSASPermissions, AccountSASServices, AccountSASResourceTypes, StorageSharedKeyCredential, SASProtocol } = require('@azure/storage-blob');
require('dotenv').config()

async function main() {
  console.log("---------------------------------------------------")
  console.log("-------BlobServiceClient----------------------------")
  const constants = {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    containerName: process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME + "-" + (0 | Math.random() * 9e6).toString(36).toLocaleLowerCase()
  };
  const blobServiceClient = new BlobServiceClient(
    `https://${constants.accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  console.log("-------Properties-----------------------------")
  await blobServiceClient.getProperties();

  // create new container
  const containerClient = blobServiceClient.getContainerClient(constants.containerName);

  console.log("--------Create container----------------------")
  await containerClient.create();


  // create sas for new container
  const sasToken = generateBlobSASQueryParameters({
      containerName: constants.containerName,
      permissions: ContainerSASPermissions.parse("fmitracwdl"), // all permissions
      protocol: SASProtocol.Https,
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + (10 * 60 * 1000)),   // 10 minutes
    },
    new DefaultAzureCredential()
    /*
    new StorageSharedKeyCredential(
      constants.accountName,
      constants.accountKey
    )
    */
  );
  console.log("---------Create SAS token--------------------------")
  // Use SAS for container
  const containerClient2 = new ContainerClient(
    `${containerClient.url}${(sasToken[0] === '?') ? sasToken : `?${sasToken}`}`,
    newPipeline(new DefaultAzureCredential())
  );

  console.log("----------Does container exist-----------------------")
  const containerExists = await containerClient2.exists();
  console.log("----------Done---------------------")

  //console.log(`${constants.containerName} exists: ${containerExists}`)
}

main()
  .then(() => {
    console.log(`done`);
  }).catch((ex) => {
    console.log(`Error: ${ex.message}`)
  });