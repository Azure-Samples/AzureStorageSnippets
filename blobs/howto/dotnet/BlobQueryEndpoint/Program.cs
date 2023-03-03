using Azure.Core;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

using ManagementTasks;

// Create an instance of DefaultAzureCredential for authorization
TokenCredential credential = new DefaultAzureCredential();

// TODO: replace with your storage account name
string storageAccountName = "<storage-account-name>";

string endpoint = await AccountProperties.GetBlobServiceEndpoint(storageAccountName, credential);
Console.WriteLine($"URI: {endpoint}");

// Now that we know the endpoint, create the client object
BlobServiceClient blobServiceClient = new(new Uri(endpoint), credential);

// List containers in the storage account
Console.WriteLine("Listing containers ...");

await foreach (BlobContainerItem container in blobServiceClient.GetBlobContainersAsync())
{
    Console.WriteLine("\t" + container.Name);
}