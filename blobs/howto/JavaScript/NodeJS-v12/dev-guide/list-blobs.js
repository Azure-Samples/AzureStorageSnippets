// index.js
const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

const client = BlobServiceClient.fromConnectionString(connString);

async function listBlobsFlatWithPageMarker(containerClient){

    // add prefix to filter list
    const blobNamePrefix = "";

    // page size
    const maxPageSize = 2;

    let i = 1;
    let marker;
    let iterator = containerClient.listBlobsFlat().byPage({ maxPageSize });
    let response = (await iterator.next()).value;
    
    // Prints 2 blob names
    for (const blob of response.segment.blobItems) {
      console.log(`Blob ${i++}: ${blob.name}`);
    }
    
    // Gets next marker
    marker = response.continuationToken;
    
    // Passing next marker as continuationToken    
    iterator = containerClient.listBlobsFlat().byPage({ continuationToken: marker, maxPageSize: maxPageSize * 2 });
    response = (await iterator.next()).value;
    
    // Prints next 4 blob names
    for (const blob of response.segment.blobItems) {
      console.log(`Blob ${i++}: ${blob.name}`);
    }
}

async function listBlobHierarchical(containerClient){
    console.log("Listing blobs by hierarchy by page, specifying a prefix and a max page size");

    // 
    const virtualHierarchyDelimiter = "/";

    // add prefix to filter list
    const blobNamePrefix = "prefix2/sub1/";

    // page size
    const maxPageSize = 2;

    let i = 1;
    for await (const response of containerClient
      .listBlobsByHierarchy(virtualHierarchyDelimiter, { prefix: blobNamePrefix })
      .byPage({ maxPageSize })) {

      console.log(`Page ${i++}`);
      const segment = response.segment;
    
      if (segment.blobPrefixes) {
        for (const prefix of segment.blobPrefixes) {
          console.log(`\tBlobPrefix: ${prefix.name}`);
        }
      }
    
      for (const blob of response.segment.blobItems) {
        console.log(`\tBlobItem: name - ${blob.name}`);
      }
    }
}

async function listBlobVersion(blobServiceClient){

}

async function listBlobSnapshot(blobServiceClient){

}

listContainers(client)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));


listContainersWithPagingMarker(client)
.then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));