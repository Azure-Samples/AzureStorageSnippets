const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// Sets tags on the underlying blob. A blob can have up to 10 tags. 
// Tag keys must be between 1 and 128 characters. Tag values must 
// be between 0 and 256 characters. Valid tag key and value characters 
// include lower and upper case letters, digits (0-9), space (' '), 
// plus ('+'), minus ('-'), period ('.'), foward slash ('/'), 
// colon (':'), equals ('='), and underscore ('_').
//
// const tags = {
//   project: 'End of month billing summary',
//   reportOwner: 'John Doe',
//   reportPresented: 'April 2022'
// }
async function setTags(containerClient, blobName, tags) {

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Set tags
  await blockBlobClient.setTags(tags);

  console.log(`uploading blob ${blobName}`);
}
async function getTags(containerClient, blobName) {

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Get tags
  const result = await blockBlobClient.getTags();

  for (const tag in result.tags) {

      console.log(`TAG: ${tag}: ${result.tags[tag]}`);
  }
}

async function findBlobsByQuery(blobServiceClient, tagOdataQuery) {

  // page size
  const maxPageSize = 10;

  let i = 1;
  let marker;

  const listOptions = {
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false
  };

  let iterator = blobServiceClient.findBlobsByTags(tagOdataQuery, listOptions).byPage({ maxPageSize });
  let response = (await iterator.next()).value;

  // Prints blob names
  if (response.blobs) {
    for (const blob of response.blobs) {
      console.log(`Blob ${i++}: ${blob.name} - ${JSON.stringify(blob.tags)}`);
    }
  }

  // Gets next marker
  marker = response.continuationToken;
  
  // no more blobs
  if (!marker) return;
  
  // Passing next marker as continuationToken
  iterator = blobServiceClient
    .findBlobsByTags(tagOdataQuery, listOptions)
    .byPage({ continuationToken: marker, maxPageSize });
  response = (await iterator.next()).value;

  // Prints blob names
  if (response.blobs) {
    for (const blob of response.blobs) {
      console.log(`Blob ${i++}: ${blob.name} - ${JSON.stringify(blob.tags)}`);
    }
  }
}

// containerName: string
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
async function createBlobFromString(client, blobName, fileContentsAsString, uploadOptions) {

  // Create blob client from container client
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  console.log(`uploading blob ${blobName}`);

  // Upload string
  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // do something with blob
  // ...
}

async function main(blobServiceClient) {

  // create container
  const timestamp = Date.now();
  const containerName = `set-tags-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

  console.log('container creation succeeded');

  // create blob 1
  const blob1 = {
    name: `${containerName}-query-by-tag-blob-a-1.txt`,
    text: `Hello from a string 1`,
    // indexed for searching
    tags: {
      createdBy: 'Bob',
      createdWith: `StorageSnippetsForDocs-1`,
      createdOn: '2022-01',
      id: '1',
      owner: 'PhillyProject',
      project: `${containerName}`
    }
  }
  await createBlobFromString(containerClient, blob1.name, blob1.text);
  await setTags(containerClient, blob1.name, blob1.tags);
  await getTags(containerClient, blob1.name);

  // create blob 2
  const blob2 = {
    name: `${containerName}-query-by-tag-blob-b-2.txt`,
    text: `Hello from a string 2`,
    // indexed for searching
    tags: {
      createdBy: 'Jill',
      createdWith: `StorageSnippetsForDocs-2`,
      createdOn: '2022-01',
      id: '2',
      owner: 'PhillyProject',
      project: `${containerName}`
    }
  };
  await createBlobFromString(containerClient, blob2.name, blob2.text);
  await setTags(containerClient, blob2.name, blob2.tags);
  await getTags(containerClient, blob2.name);

  // create blob 3
  const blob3 = {
    name: `${containerName}-query-by-tag-blob-a-3.txt`,
    text: `Hello from a string 3`,
    // indexed for searching
    tags: {
      createdBy: 'Morgan',
      createdWith: `StorageSnippetsForDocs-3`,
      createdOn: '2022-08',
      id: '3',
      owner: 'PhillyProject',
      project: `${containerName}`
    }
  };
  await createBlobFromString(containerClient, blob3.name, blob3.text);
  await setTags(containerClient, blob3.name, blob3.tags);
  await getTags(containerClient, blob3.name);

  // query 1 
  const odataTagQuery1 = `id='1' AND project='${containerName}'`;
  console.log(`\n\nfind tags with ${odataTagQuery1}`)
  await findBlobsByQuery(blobServiceClient, odataTagQuery1);

  // query 2 
  // should return all blobs meeting these properties
  const odataTagQuery2 = `owner='PhillyProject' AND project='${containerName}' AND createdOn='2022-01'`;
  console.log(`\n\nfind tags with ${odataTagQuery2}`)
  await findBlobsByQuery(blobServiceClient, odataTagQuery2);

  // query 3 
  // should return all blobs meeting these properties
  const odataTagQuery3 = `owner='PhillyProject' AND project='${containerName}' AND createdOn >= '2021-12' AND createdOn <= '2022-06'`;
  console.log(`\n\nfind tags with ${odataTagQuery3}`)
  await findBlobsByQuery(blobServiceClient, odataTagQuery3);

  // query 4 
  // should return all blobs in the container
  const odataTagQuery4 = `@container = '${containerName}' AND createdBy = 'Jill'`;
  console.log(`\n\nfind tags with ${odataTagQuery4}`)
  await findBlobsByQuery(blobServiceClient, odataTagQuery4);  

}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
