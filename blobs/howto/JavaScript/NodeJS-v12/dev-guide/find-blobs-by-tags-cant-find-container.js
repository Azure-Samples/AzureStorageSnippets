// index.js
const { BlobServiceClient, BlobClient } = require("@azure/storage-blob");
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");
const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function findBlobsByTag(blobStorageClient, odataTagQuery, prefix) {

  let foundBlobNames = [];

  let i = 1;
  for await (const blob of blobStorageClient.findBlobsByTags(odataTagQuery)) {
    console.log(`Blob ${i++}: ${blob.containerName}/${blob.name}:${blob.tagValue}`);
    foundBlobNames.push(blob.name);

    try {

      // don't return blobs marked for deletion
      const blobClient = new BlobClient(connString, blob.containerName, blob.name);

      if(!connString || !blob.containerName || !blob.name)console.log("blob property - missing c'tor info");

      // this line fails - with can't find container
      // the error is buried in the details - this isn't the pattern of some of the other methods
      const currentProperties = await blobClient.getProperties();
      if (currentProperties.deletedOn) {
        console.log(`${blob.name} properties - deleted on ${blob.deletedOn}`);
      } else {
        console.log(`${blob.name} properties - not deleted`);
      }
    } catch (ex) {
      console.log(ex.details.errorCode)
      throw new Error(ex.details.errorCode);
    }
  }

  return foundBlobNames;
}

async function createBlobFromString(client, blobName, fileContentsAsString, uploadOptions, indexableTags) {
  console.log(`creating blob from string ${blobName}`);
  const blockBlobClient = await client.getBlockBlobClient(blobName);
  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);
  console.log(`created blob ${blobName}`);

  await blockBlobClient.setTags(indexableTags);
  console.log(`set tags on blob ${blockBlobClient.name}`);
}

async function main() {

  try {
    const timestamp = Date.now();

    const containerName1 = `query-by-tag-1-${timestamp}`;
    console.log(`creating container ${containerName1}`);

    // create blob 1
    const blob1 = {
      name: `query-by-tag-blob-a-1.txt`,
      text: `Hello from a string 1`,
      tags: {
        owner: 'PhillyProject'
      },
      options: {
        metadata: {
          id: '1'
        }
      }
    }

    const containerOptions = {
      access: 'container'
    }; 
    const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName1, containerOptions);

    console.log(`creating blob ${blob1.name}`);
    await createBlobFromString(containerClient, blob1.name, blob1.text, blob1.options, blob1.tags);

    // query 0 - all containers, no tags, no prefix
    // should return all blobs
    const odataTagQuery0 = 'owner=\'PhillyProject\'';
    console.log(`find tags with ${odataTagQuery0}`)
    await findBlobsByTag(blobServiceClient, odataTagQuery0);

  } catch (ex) {
    console.log(ex.message);
    throw (ex);
  }
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error returned: ${ex.message}`));
