const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require('uuid');

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

// Create a unique name for the container
const containerName = "quickstart" + uuidv4();

async function getContainerClient(blobServiceClient, containerName){
    
    // Get a reference to a container
    return await blobServiceClient.getContainerClient(containerName);

}

async function createRootContainer(blobServiceClient){
    // Create the container - the client already knows the name
    const createContainerResponse = await blobServiceClient.createContainer("$root");

    console.log(
    "Container was created successfully. requestId: ",
    createContainerResponse.requestId
    );

    return createContainerResponse;
}
async function createContainer(){
    
    // Create the container - the client already knows the name
    const createContainerResponse = await containerClient.create();

    console.log(
    "Container was created successfully. requestId: ",
    createContainerResponse.requestId
    );

    return createContainerResponse;
}
async function deleteContainer(){
    
}
async function getContainer(containerClient){
    
}