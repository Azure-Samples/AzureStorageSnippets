using System.Collections;
using System.IO.Compression;
using System.Text;
using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;

namespace BlobDevGuideBlobs
{
    class CreateSAS
    {
        public static async Task CreateUserDelegationSASSamples(BlobServiceClient blobServiceClient)
        {
            // Get a user delegation key
            UserDelegationKey userDelegationKey = RequestUserDelegationKey(blobServiceClient).Result;

            // <Snippet_UseUserDelegationSASContainer>
            // Create a Uri object with a user delegation SAS appended
            BlobContainerClient containerClient = blobServiceClient
                .GetBlobContainerClient("sample-container");
            Uri containerSASURI = await CreateUserDelegationSASContainer(containerClient, userDelegationKey);

            // Create a container client object with SAS authorization
            BlobContainerClient containerClientSAS = new BlobContainerClient(containerSASURI);
            // </Snippet_UseUserDelegationSASContainer>

            // <Snippet_UseUserDelegationSASBlob>
            // Create a Uri object with a user delegation SAS appended
            BlobClient blobClient = blobServiceClient
                .GetBlobContainerClient("sample-container")
                .GetBlobClient("sample-blob.txt");
            Uri blobSASURI = await CreateUserDelegationSASBlob(blobClient, userDelegationKey);

            // Create a blob client object with SAS authorization
            BlobClient blobClientSAS = new BlobClient(blobSASURI);
            // </Snippet_UseUserDelegationSASBlob>
        }

        public static async Task CreateServiceSASSamples(BlobServiceClient blobServiceClient)
        {
            string accountName = "<storage-account-name>";
            string accountKey = "<storage-account-key";
            StorageSharedKeyCredential storageSharedKeyCredential =
                new(accountName, accountKey);
            BlobServiceClient blobServiceClientSharedKey = new BlobServiceClient(
                new Uri($"https://{accountName}.blob.core.windows.net"),
                storageSharedKeyCredential);

            // <Snippet_UseServiceSASContainer>
            // Create a Uri object with a service SAS appended
            BlobContainerClient containerClient = blobServiceClientSharedKey
                .GetBlobContainerClient("sample-container");
            Uri containerSASURI = await CreateServiceSASContainer(containerClient);

            // Create a container client object representing 'sample-container' with SAS authorization
            BlobContainerClient containerClientSAS = new BlobContainerClient(containerSASURI);
            // </Snippet_UseServiceSASContainer>

            // <Snippet_UseServiceSASBlob>
            // Create a Uri object with a service SAS appended
            BlobClient blobClient = blobServiceClientSharedKey
                .GetBlobContainerClient("sample-container")
                .GetBlobClient("sample-blob.txt");
            Uri blobSASURI = await CreateServiceSASBlob(blobClient);

            // Create a blob client object representing 'sample-blob.txt' with SAS authorization
            BlobClient blobClientSAS = new BlobClient(blobSASURI);
            // </Snippet_UseServiceSASBlob>
        }

        public static async Task CreateAccountSASSamples(BlobServiceClient blobServiceClient)
        {
            // <Snippet_UseAccountSAS>
            string accountName = "<storage-account-name>";
            string accountKey = "<storage-account-key>";
            StorageSharedKeyCredential storageSharedKeyCredential =
                new(accountName, accountKey);

            // Create a BlobServiceClient object with the account SAS appended
            string blobServiceURI = $"https://{accountName}.blob.core.windows.net";
            string sasToken = await CreateAccountSAS(storageSharedKeyCredential);
            BlobServiceClient blobServiceClientAccountSAS = new BlobServiceClient(
                new Uri($"{blobServiceURI}?{sasToken}"));
            // </Snippet_UseAccountSAS>
        }

        // <Snippet_RequestUserDelegationKey>
        public static async Task<UserDelegationKey> RequestUserDelegationKey(
            BlobServiceClient blobServiceClient)
        {
            // Get a user delegation key for the Blob service that's valid for 1 day
            UserDelegationKey userDelegationKey =
                await blobServiceClient.GetUserDelegationKeyAsync(
                    DateTimeOffset.UtcNow,
                    DateTimeOffset.UtcNow.AddDays(1));

            return userDelegationKey;
        }
        // </Snippet_RequestUserDelegationKey>

        // <Snippet_CreateUserDelegationSASContainer>
        public static async Task<Uri> CreateUserDelegationSASContainer(
            BlobContainerClient containerClient,
            UserDelegationKey userDelegationKey)
        {
            // Create a SAS token for the container resource that's also valid for 1 day
            BlobSasBuilder sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = containerClient.Name,
                Resource = "c",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(1)
            };

            // Specify the necessary permissions
            sasBuilder.SetPermissions(BlobSasPermissions.Read | BlobSasPermissions.Write);

            // Add the SAS token to the blob URI
            BlobUriBuilder uriBuilder = new BlobUriBuilder(containerClient.Uri)
            {
                // Specify the user delegation key
                Sas = sasBuilder.ToSasQueryParameters(
                    userDelegationKey,
                    containerClient.GetParentBlobServiceClient().AccountName)
            };

            return uriBuilder.ToUri();
        }
        // </Snippet_CreateUserDelegationSASContainer>

        // <Snippet_CreateUserDelegationSASBlob>
        public static async Task<Uri> CreateUserDelegationSASBlob(
            BlobClient blobClient,
            UserDelegationKey userDelegationKey)
        {
            // Create a SAS token for the blob resource that's also valid for 1 day
            BlobSasBuilder sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = blobClient.Name,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(1)
            };

            // Specify the necessary permissions
            sasBuilder.SetPermissions(BlobSasPermissions.Read | BlobSasPermissions.Write);

            // Add the SAS token to the blob URI
            BlobUriBuilder uriBuilder = new BlobUriBuilder(blobClient.Uri)
            {
                // Specify the user delegation key
                Sas = sasBuilder.ToSasQueryParameters(
                    userDelegationKey,
                    blobClient
                    .GetParentBlobContainerClient()
                    .GetParentBlobServiceClient().AccountName)
            };

            return uriBuilder.ToUri();
        }
        // </Snippet_CreateUserDelegationSASBlob>

        // <Snippet_CreateServiceSASContainer>
        public static async Task<Uri> CreateServiceSASContainer(
            BlobContainerClient containerClient,
            string storedPolicyName = null)
        {
            // Check if BlobContainerClient object has been authorized with Shared Key
            if (containerClient.CanGenerateSasUri)
            {
                // Create a SAS token that's valid for one day
                BlobSasBuilder sasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = containerClient.Name,
                    Resource = "c"
                };

                if (storedPolicyName == null)
                {
                    sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddDays(1);
                    sasBuilder.SetPermissions(BlobContainerSasPermissions.Read);
                }
                else
                {
                    sasBuilder.Identifier = storedPolicyName;
                }

                Uri sasURI = containerClient.GenerateSasUri(sasBuilder);

                return sasURI;
            }
            else
            {
                // Client object is not authorized via Shared Key
                return null;
            }
        }
        // </Snippet_CreateServiceSASContainer>

        // <Snippet_CreateServiceSASBlob>
        public static async Task<Uri> CreateServiceSASBlob(
            BlobClient blobClient,
            string storedPolicyName = null)
        {
            // Check if BlobContainerClient object has been authorized with Shared Key
            if (blobClient.CanGenerateSasUri)
            {
                // Create a SAS token that's valid for one day
                BlobSasBuilder sasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = blobClient.GetParentBlobContainerClient().Name,
                    BlobName = blobClient.Name,
                    Resource = "b"
                };

                if (storedPolicyName == null)
                {
                    sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddDays(1);
                    sasBuilder.SetPermissions(BlobContainerSasPermissions.Read);
                }
                else
                {
                    sasBuilder.Identifier = storedPolicyName;
                }

                Uri sasURI = blobClient.GenerateSasUri(sasBuilder);

                return sasURI;
            }
            else
            {
                // Client object is not authorized via Shared Key
                return null;
            }
        }
        // </Snippet_CreateServiceSASBlob>

        // <Snippet_CreateAccountSAS>
        public static async Task<string> CreateAccountSAS(StorageSharedKeyCredential sharedKey)
        {
            // Create a SAS token that's valid for one day
            AccountSasBuilder sasBuilder = new AccountSasBuilder()
            {
                Services = AccountSasServices.Blobs | AccountSasServices.Queues,
                ResourceTypes = AccountSasResourceTypes.Service,
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(1),
                Protocol = SasProtocol.Https
            };

            sasBuilder.SetPermissions(AccountSasPermissions.Read |
                AccountSasPermissions.Write);

            // Use the key to get the SAS token
            string sasToken = sasBuilder.ToSasQueryParameters(sharedKey).ToString();

            return sasToken;
        }
        // </Snippet_CreateAccountSAS>
    }
}