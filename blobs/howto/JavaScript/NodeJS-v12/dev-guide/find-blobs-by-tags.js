// index.js
const { BlobServiceClient } = require("@azure/storage-blob");
const assert = require("assert");
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
  }

  return foundBlobNames;
}

async function findBlobsByTagPageMarker(blobStorageClient, odataTagQuery, prefix) {

  // page size
  const maxPageSize = 2;

  let i = 1;
  let marker;

  const listOptions = {
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: prefix
  };

  let foundBlobNames = [];

  let iterator = blobStorageClient.findBlobsByTags(odataTagQuery, listOptions).byPage({ maxPageSize });
  let response = (await iterator.next()).value;

  // Prints 2 blob names
  for (const blob of response.segment.blobItems) {
    console.log(`Blob ${i++}: ${blob.name}`);
    foundBlobNames.push(blob.name);
  }

  // Gets next marker
  marker = response.continuationToken;

  // Passing next marker as continuationToken    
  iterator = blobStorageClient.listBlobsFlat(odataTagQuery, listOptions).byPage({ continuationToken: marker, maxPageSize: maxPageSize * 2 });
  response = (await iterator.next()).value;

  // Prints next 4 blob names
  // should gracefully fail because there aren't 4 blobs in results
  for (const blob of response.segment.blobItems) {
    console.log(`Blob ${i++}: ${blob.name}`);
    foundBlobNames.push(blob.name);
  }

  return foundBlobNames;
}
async function setTagsOnBlob(blockBlobClient, tags){
  // tags aren't guaranteed to persist unless you set them explicitly after upload or copy
  const blobSetTagsResponse = await blockBlobClient.setTags(tags);

  if (blobSetTagsResponse.errorCode) console.log(`can't set tags on blob ${blockBlobClient.name}`);
}
async function createBlobFromString(client, blobName, fileContentsAsString, uploadOptions, indexableTags) {
  console.log(`creating blob from string ${blobName}`);
  const blockBlobClient = await client.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);
  if (uploadBlobResponse.errorCode) console.log(`can't create blob ${blobName}`);

  await setTagsOnBlob(blockBlobClient, indexableTags);
}

async function createContainer1AndBlobs(containerName1, blob1) {

  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName1);

  if (!containerCreateResponse.errorCode) {

    console.log(`creating blob ${blob1.name}`);
    await createBlobFromString(containerClient, blob1.name, blob1.text, blob1.options, blob1.tags);
  }
}

async function createContainer2AndBlobs(containerName2, blob2, blob3) {

  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName2);

  if (!containerCreateResponse.errorCode) {

    console.log(`creating blob ${blob2.name}`);
    await createBlobFromString(containerClient, blob2.name, blob2.text, blob2.options, blob2.tags);

    console.log(`creating blob ${blob3.name}`);
    await createBlobFromString(containerClient, blob3.name, blob3.text, blob3.options, blob3.tags);
  }
}

async function main() {

  const timestamp = Date.now();

  const containerName1 = `query-by-tag-1-${timestamp}`;
  console.log(`creating container ${containerName1}`);

  const containerName2 = `query-by-tag-2-${timestamp}`;
  console.log(`creating container ${containerName2}`);

  // Encryption of metadata and tags:
  // Blob index tags are encrypted at rest using a Microsoft-managed key. 
  // Metadata is encrypted at rest using the same encryption key specified for blob data.

  // create blob 1
  const blob1 = {
    name: `query-by-tag-blob-a-1.txt`,
    text: `Hello from a string 1`,
    // indexed for searching
    tags: {
      createdBy: 'Bob',
      createdWith: `StorageSnippetsForDocs-1`,
      createdOn: '2022-01',
      id: '1',
      owner: 'PhillyProject'
    },
    options: {

      // not indexed for searching
      metadata: {
        owner: 'PhillyProject',
        id: '1',
        container: containerName1
      }
    }
  }
  // create blob 2
  const blob2 = {
    name: `query-by-tag-blob-b-2.txt`,
    text: `Hello from a string 2`,
    // indexed for searching
    tags: {
      createdBy: 'Jill',
      createdWith: `StorageSnippetsForDocs-2`,
      createdOn: '2022-01',
      id: '2',
      owner: 'PhillyProject'
    },
    options: {
      // not indexed for searching
      metadata: {
        owner: 'PhillyProject',
        id: '2'
      }
    }
  };
  // create blob 3
  const blob3 = {
    name: `query-by-tag-blob-a-3.txt`,
    text: `Hello from a string 3`,
    // indexed for searching
    tags: {
      createdBy: 'Morgan',
      createdWith: `StorageSnippetsForDocs-3`,
      createdOn: '2022-08',
      id: '3',
      owner: 'PhillyProject'
    },
    options: {

      // not indexed for searching
      metadata: {
        owner: 'PhillyProject',
        id: '3'
      }
    }
  };

  // create 2 containers
  await createContainer1AndBlobs(containerName1, blob1);
  await createContainer2AndBlobs(containerName2, blob2, blob3);

  // query 0 - all containers, no tags, no prefix
  // should return all blobs
  const odataTagQuery0 = 'owner=\'PhillyProject\'';
  const foundBlobs0 = await findBlobsByTag(blobServiceClient, odataTagQuery0);
  assert.equal(3, foundBlobs0.length);
  /*
  // query 1 - all containers, specific tag, specific value, blob prefix
  // should return query-by-tag-blob-a-1.txt
  const odataTagQuery1 = 'createdOn=\'2022-01\'';
  const blobPrefix1 = 'query-by-tag-blob-a';

  const foundBlobs1 = await findBlobsByTag(blobServiceClient, odataTagQuery1, blobPrefix1);
  //const foundBlobs = await findBlobsByTagPageMarker(blobServiceClient, odataTagQuery1, blobPrefix1);
  assert.equal(blob1.name, foundBlobs1[0]);

  // query 2 - all containers, specific tag, range of values, blob prefix
  // should return query-by-tag-blob-b-2.txt
  const odataTagQuery2 = 'createdOn >= \'2021-12\' AND createdOn <= \'2022-06\'';
  const blobPrefix2 = 'query-by-tag-b';

  const foundBlobs2 = await findBlobsByTag(blobServiceClient, odataTagQuery2, blobPrefix2);
  //const foundBlobs2 = await findBlobsByTagPageMarker(blobServiceClient, odataTagQuery2, blobPrefix2);
  assert.equal(blob2.name, foundBlobs2[0]);

  // query 3 - specific container, blob prefix
  // should return query-by-tag-blob-a-3.txt
  const odataTagQuery3 = `@container = ${containerName2}`;
  const blobPrefix3 = 'query-by-tag-blob-a';
  const foundBlobs3 = await findBlobsByTagPageMarker(blobServiceClient, odataTagQuery3, blobPrefix3);
  assert.equal(blob3.name, foundBlobs3[0]);
*/
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
