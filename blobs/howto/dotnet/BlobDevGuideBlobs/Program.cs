using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Specialized;

using BlobDevGuide;
using BlobDevGuideBlobs;

var blobServiceClient = new BlobServiceClient(
        new Uri("https://<storage-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

#region Lease blob operations
/*
BlobClient blobClient = blobServiceClient
    .GetBlobContainerClient("sample-container")
    .GetBlobClient("sample-blob.txt");

BlobLeaseClient leaseClient = await LeaseBlob.AcquireBlobLeaseAsync(blobClient);
await LeaseBlob.RenewBlobLeaseAsync(blobClient, leaseClient.LeaseId);
await LeaseBlob.ReleaseBlobLeaseAsync(blobClient, leaseClient.LeaseId);
//await LeaseBlob.BreakBlobLeaseAsync(blobClient);
*/
#endregion

#region Lease container operations
/*
BlobContainerClient containerClient = blobServiceClient
    .GetBlobContainerClient("sample-container");

BlobLeaseClient leaseClient = await LeaseContainer.AcquireContainerLeaseAsync(containerClient);
await LeaseContainer.RenewContainerLeaseAsync(containerClient, leaseClient.LeaseId);
await LeaseContainer.ReleaseContainerLeaseAsync(containerClient, leaseClient.LeaseId);
//await LeaseContainer.BreakContainerLeaseAsync(containerClient);
*/
#endregion

#region Copy blob within a storage account
/*
// Instantiate BlobClient for the source blob and destination blob
BlobClient sourceBlob = blobServiceClient
    .GetBlobContainerClient("source-container")
    .GetBlobClient("sample-blob.txt");
BlockBlobClient destinationBlob = blobServiceClient
    .GetBlobContainerClient("destination-container")
    .GetBlockBlobClient("sample-blob.txt");

// Using Copy Blob API
//await CopyBlob.CopyWithinStorageAccountAsync(sourceBlob, destinationBlob);

// Using Put Blob From URL API
//await PutBlobFromURL.CopyWithinStorageAccountAsync(sourceBlob, destinationBlob);
*/
#endregion

#region Copy blob across storage accounts
/*
BlobServiceClient blobServiceClientSrc = new(
        new Uri("https://<src-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

BlobServiceClient blobServiceClientDest = new(
        new Uri("https://<destination-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

BlobClient srcBlob = blobServiceClientSrc
    .GetBlobContainerClient("source-container")
    .GetBlobClient("sample-blob.txt");

BlockBlobClient destBlob = blobServiceClientDest
    .GetBlobContainerClient("destination-container")
    .GetBlockBlobClient("sample-blob.txt");

// Using Copy Blob API
//await CopyBlob.CopyAcrossStorageAccountsAsync(srcBlob, destBlob);

// Using Put Blob From URL API
//await PutBlobFromURL.CopyAcrossStorageAccountsAsync(srcBlob, destBlob);
*/
#endregion

#region Copy blob from external source
/*
// Instantiate BlobClient for the source blob and destination blob
BlobClient sourceBlob = blobServiceClient
    .GetBlobContainerClient("source-container")
    .GetBlobClient("sample-blob.txt");
BlockBlobClient destinationBlob = blobServiceClient
    .GetBlobContainerClient("destination-container")
    .GetBlockBlobClient("sample-blob.txt");

// Using Copy Blob API
//await CopyBlob.CopyFromExternalSourceAsync("<source-url>", destinationBlob);

// Using Put Blob From URL API
//await PutBlobFromURL.CopyFromExternalSourceAsync("<source-url>", destinationBlob);
*/
#endregion

#region Copy blob snapshot
/*
// Instantiate BlockBlobClient for the destination blob
BlockBlobClient client = blobServiceClient
    .GetBlobContainerClient("sample-container")
    .GetBlockBlobClient("sample-blob.txt");

string snapshot = "<snapshot-timestamp>";

client = await CopySnapshot.CopySnapshotOverBaseBlobAsync(client, snapshot);
*/
#endregion

#region Copy blob version
/*
// Instantiate BlockBlobClient for the destination blob
BlockBlobClient client = blobServiceClient
    .GetBlobContainerClient("sample-container")
    .GetBlockBlobClient("sample-blob.txt");

string version = "<version-timestamp>";

client = await CopyVersion.CopyVersionOverBaseBlobAsync(client, version);
*/
#endregion