using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Specialized;

using BlobDevGuide;
using BlobDevGuideBlobs;

#region Copy blob within a storage account
/*
var blobServiceClient = new BlobServiceClient(
        new Uri("https://<storage-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

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
string srcAccountName = "<source-account-name";
string srcAccountKey = "<account-key>";
BlobServiceClient blobServiceClientSrc = new(
        new Uri($"https://{srcAccountName}.blob.core.windows.net"),
        new StorageSharedKeyCredential(srcAccountName, srcAccountKey));

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
var blobServiceClient = new BlobServiceClient(
        new Uri("https://<storage-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

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