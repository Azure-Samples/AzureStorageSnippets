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
            // Note: to use GenerateSasUri() for the source blob, the
            // source blob client must be authorized via account key

            // Set the SAS token to expire in 60 minutes, as an example
            DateTimeOffset expiresOn = DateTimeOffset.UtcNow.AddMinutes(60);

            // Create a Uri object with a SAS token appended - specify Read (r) permissions
            Uri sourceBlobSASURI = sourceBlob.GenerateSasUri(BlobSasPermissions.Read, expiresOn);

            // Start the copy operation and wait for it to complete
            CopyFromUriOperation copyOperation = await destinationBlob.StartCopyFromUriAsync(sourceBlobSASURI);
            await copyOperation.WaitForCompletionAsync();
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
