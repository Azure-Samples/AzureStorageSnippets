const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const { v4: uuidv4 } = require('uuid');


// Enter your storage account name and SAS
const account = process.env.ACCOUNT_NAME || "diberrystoragedevguide1";// "<account name>";
const accountKey = process.env.ACCOUNT_SAS || "";// "<account SAS>";

if (!account || !accountKey) {
  throw Error("Azure Storage required params are empty");
}

// Use StorageSharedKeyCredential with storage account and account key
// StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
// ONLY AVAILABLE IN NODE.JS RUNTIME
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

// <snippet_createContainer>
async function createContainer(blobServiceClient, containerName){
  const container =  await blobServiceClient.createContainer(containerName);
  console.log(container);
}
// </snippet_createRootContainer>

// <snippet_createRootContainer>
// Optional
// Allows you to keep blobs at root level via URL
// https://myaccount.blob.core.windows.net/default.html
async function createRootContainer(blobServiceClient){
  const { containerClient } =  await blobServiceClient.createContainer("$root");
  console.log(`root container created`);
  return containerClient;
}
// </snippet_createRootContainer>

// <snippet_deleteRootContainer>
async function deleteRootContainer(blobServiceClient){

  const options = {};

  const containerDeleteResponse =  await blobServiceClient.deleteContainer("$root", options);
  console.log(containerDeleteResponse);
  console.log(`root container deleted`)
}
// </snippet_deleteRootContainer>

// <snippet_createContainer>
async function createContainer(blobServiceClient, containerName){

  const options = {

    // full public read access at container level
    // choice: `container` or `blob`
    access: container,
    
    // return metadata
    metadata: true

  }

  const { containerClient } =  await blobServiceClient.createContainer(containerName, options);
  
  if (await containerClient.exists())
  {
      Console.WriteLine("Created container {0}", containerClient.Name);
      return containerClient;
  }
}
// </snippet_createContainer>

// <snippet_deleteContainer>
async function deleteRootContainer(blobServiceClient, containerName){
  const containerDeleteResponse =  await blobServiceClient.deleteContainer(containerName, containerName);
  console.log(containerDeleteResponse);
  console.log(`${containerName} deleted`)
}
// </snippet_deleteContainer>

async function main(blobServiceClient){

  // Optional
  // Allows you to keep blobs at root level via URL
  // https://myaccount.blob.core.windows.net/default.html
  await createRootContainer(blobServiceClient);
  await deleteRootContainer(blobServiceClient);


  // Create another container
  // Create a unique name for the container
  //const containerName = "storage_samples_" + uuidv4();
  const containerClient = await createContainer(blobServiceClient, containerName);
  await deleteContainer(blobServiceClient, containerName);  

  console.log("done");
}

// Must be new/unused Storage account
main(blobServiceClient).catch((err =>{
  console.log(err);
}))

