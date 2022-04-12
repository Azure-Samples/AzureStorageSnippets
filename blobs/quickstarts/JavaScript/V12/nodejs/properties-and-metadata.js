const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

const client = BlobServiceClient.fromConnectionString(connString);

async function listContainers(blobServiceClient){

  for await (const containerItem of blobServiceClient.listContainers()) {

      console.log(`${containerItem.name} with version ${containerItem.version} last modified on ${containerItem.properties.lastModified}`);
      const containerClient = blobServiceClient.getContainerClient(containerItem.name);

      // Get Properties including existing metadata
      const containerProperties = await containerClient.getProperties();
      console.log(containerProperties);

      // Set metadata
      await setMetadataOfContainer(containerClient);

      // Get updated metadata from properties
      const containerProperties2 = await containerClient.getProperties();
      console.log(containerProperties2.metadata);
  }
}

async function setMetadataOfContainer(containerClient){

      const currentDate = new Date();

      const metadata = {
        // values must be strings
        lastDateSet: currentDate.toString()
      }

      const response = await containerClient.setMetadata(metadata);

      if(!response.errorCode){
        console.log(`metadata set to ${metadata.lastDateSet}`);
      }
}


listContainers(client)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
