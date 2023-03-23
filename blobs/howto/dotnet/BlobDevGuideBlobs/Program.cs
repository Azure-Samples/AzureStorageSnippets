using Azure.Identity;
using Azure.Storage.Blobs;

using BlobDevGuide;

// <Snippet_CopyWithinStorageAccount>
var blobServiceClient = new BlobServiceClient(
        new Uri("https://<storage-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

// Instantiate BlobClient for the source blob and destination blob
BlobClient sourceBlob = blobServiceClient
    .GetBlobContainerClient("source-container")
    .GetBlobClient("sample-blob.txt");
BlobClient destinationBlob = blobServiceClient
    .GetBlobContainerClient("destination-container")
    .GetBlobClient("sample-blob.txt");

await CopyBlob.CopyBlobAsync(sourceBlob.Uri, destinationBlob);
// </Snippet_CopyWithinStorageAccount>

// <Snippet_CopyAcrossStorageAccounts>
string accountNameSrc = "<source-storage-account-name>";
string containerNameSrc = "source-container";
string blobNameSrc = "sample-blob.txt";

// When copying from another storage account, the source blob must be authorized with a SAS token
// The SAS token for the source blob needs to have the Read ('r') permission
string sasToken = "<sas-token>";

// Append the SAS token to the URI - include ? before the SAS token
var srcBlobURI = new Uri($"https://{accountNameSrc}.blob.core.windows.net/{containerNameSrc}/{blobNameSrc}?{sasToken}");

BlobServiceClient blobServiceClientDestination = new(
        new Uri("https://<dest-storage-account-name>.blob.core.windows.net"),
        new DefaultAzureCredential());

BlobClient destBlob = blobServiceClientDestination
    .GetBlobContainerClient("destination-container")
    .GetBlobClient("sample-blob.txt");

await CopyBlob.CopyBlobAsync(srcBlobURI, destBlob);
// </Snippet_CopyAcrossStorageAccounts>
