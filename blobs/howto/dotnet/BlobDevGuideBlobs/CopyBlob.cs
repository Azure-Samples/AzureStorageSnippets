using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;

namespace BlobDevGuide
{
    class CopyBlob
    {
        //-------------------------------------------------
        // Check blob copy status
        //-------------------------------------------------
        // <Snippet_CheckStatusCopyBlob>
        public static async Task CheckCopyStatusAsync(CopyFromUriOperation copyOperation)
        {
            // Check for the latest status of the copy operation
            Response response = await copyOperation.UpdateStatusAsync();

            // Parse the response to find x-ms-copy-status header
            if (response.Headers.TryGetValue("x-ms-copy-status", out string value))
                Console.WriteLine($"Copy status: {value}");
        }
        // </Snippet_CheckStatusCopyBlob>

        // <Snippet_CopyWithinAccount_CopyBlob>
        //-------------------------------------------------
        // Copy a blob from the same storage account
        //-------------------------------------------------
        public static async Task CopyWithinStorageAccountAsync(
            BlobClient sourceBlob,
            BlockBlobClient destinationBlob)
        {
            // Lease the source blob to prevent changes during the copy operation
            BlobLeaseClient sourceBlobLease = new(sourceBlob);

            try
            {
                await sourceBlobLease.AcquireAsync(BlobLeaseClient.InfiniteLeaseDuration);

                // Start the copy operation and wait for it to complete
                CopyFromUriOperation copyOperation = 
                    await destinationBlob.StartCopyFromUriAsync(sourceBlob.Uri);
                await copyOperation.WaitForCompletionAsync();
            }
            catch (RequestFailedException ex)
            {
                // Handle the exception
            }
            finally
            {
                // Release the lease once the copy operation completes
                await sourceBlobLease.ReleaseAsync();
            }
        }
        // </Snippet_CopyWithinAccount_CopyBlob>

        // <Snippet_CopyAcrossAccounts_CopyBlob>
        //-------------------------------------------------
        // Copy a blob from a different storage account
        //-------------------------------------------------
        public static async Task CopyAcrossStorageAccountsAsync(
            BlobClient sourceBlob,
            BlockBlobClient destinationBlob)
        {
            // Lease the source blob to prevent changes during the copy operation
            BlobLeaseClient sourceBlobLease = new(sourceBlob);

            // Create a Uri object with a SAS token appended - specify Read (r) permissions
            Uri sourceBlobSASURI = await GenerateUserDelegationSAS(sourceBlob);

            try
            {
                await sourceBlobLease.AcquireAsync(BlobLeaseClient.InfiniteLeaseDuration);

                // Start the copy operation and wait for it to complete
                CopyFromUriOperation copyOperation = await destinationBlob.StartCopyFromUriAsync(sourceBlobSASURI);
                await copyOperation.WaitForCompletionAsync();
            }
            catch (RequestFailedException ex)
            {
                // Handle the exception
            }
            finally
            {
                // Release the lease once the copy operation completes
                await sourceBlobLease.ReleaseAsync();
            }
        }

        async static Task<Uri> GenerateUserDelegationSAS(BlobClient sourceBlob)
        {
            BlobServiceClient blobServiceClient =
                sourceBlob.GetParentBlobContainerClient().GetParentBlobServiceClient();

            // Get a user delegation key for the Blob service that's valid for 1 day
            UserDelegationKey userDelegationKey =
                await blobServiceClient.GetUserDelegationKeyAsync(DateTimeOffset.UtcNow,
                                                                  DateTimeOffset.UtcNow.AddDays(1));

            // Create a SAS token that's also valid for 1 day
            BlobSasBuilder sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = sourceBlob.BlobContainerName,
                BlobName = sourceBlob.Name,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(1)
            };

            // Specify read permissions for the SAS
            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            // Add the SAS token to the blob URI
            BlobUriBuilder blobUriBuilder = new BlobUriBuilder(sourceBlob.Uri)
            {
                // Specify the user delegation key
                Sas = sasBuilder.ToSasQueryParameters(userDelegationKey,
                                                      blobServiceClient.AccountName)
            };

            return blobUriBuilder.ToUri();
        }
        // </Snippet_CopyAcrossAccounts_CopyBlob>

        // <Snippet_CopyFromExternalSource_CopyBlob>
        //-------------------------------------------------
        // Copy a blob from an external source
        //-------------------------------------------------
        public static async Task CopyFromExternalSourceAsync(
            string sourceLocation,
            BlockBlobClient destinationBlob)
        {
            Uri sourceUri = new(sourceLocation);

            // Start the copy operation and wait for it to complete
            CopyFromUriOperation copyOperation = await destinationBlob.StartCopyFromUriAsync(sourceUri);
            await copyOperation.WaitForCompletionAsync();
        }
        // </Snippet_CopyFromExternalSource_CopyBlob>

        //-------------------------------------------------
        // Abort a blob copy operation
        //-------------------------------------------------
        // <Snippet_AbortBlobCopy>
        public static async Task AbortBlobCopyAsync(
            CopyFromUriOperation copyOperation,
            BlobClient destinationBlob)
        {
            // Check for the latest status of the copy operation
            Response response = await copyOperation.UpdateStatusAsync();

            // Parse the response to find x-ms-copy-status header
            if (response.Headers.TryGetValue("x-ms-copy-status", out string value))
            {
                if (value == "pending")
                {
                    await destinationBlob.AbortCopyFromUriAsync(copyOperation.Id);
                    Console.WriteLine($"Copy operation {copyOperation.Id} aborted");
                }
            }
        }
        // </Snippet_AbortBlobCopy>        
    }
}
