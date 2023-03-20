using System.ComponentModel;
using System.Reflection.Metadata;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

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
        //-------------------------------------------------
        // Copy a blob
        //-------------------------------------------------
        // <Snippet_CopyBlob>
        public static async Task CopyBlobAsync(BlobServiceClient blobServiceClient)
        {
            // Instantiate BlobClient for the source blob and destination blob
            BlobClient sourceBlob = blobServiceClient
                .GetBlobContainerClient("source-container")
                .GetBlobClient("sample-blob.txt");
            BlobClient destinationBlob = blobServiceClient
                .GetBlobContainerClient("destination-container")
                .GetBlobClient("sample-blob.txt");

            // Lease the source blob for the copy operation 
            // to prevent another client from modifying it
            BlobLeaseClient lease = sourceBlob.GetBlobLeaseClient();

            try
            {
                // Acquire an infinite lease on the source blob
                await lease.AcquireAsync(BlobLeaseClient.InfiniteLeaseDuration);

                // Start the copy operation and wait for it to complete
                CopyFromUriOperation copyOperation = await destinationBlob.StartCopyFromUriAsync(sourceBlob.Uri);
                await copyOperation.WaitForCompletionAsync();
            }
            catch (RequestFailedException ex)
            {
                // Handle the exception
            }
            finally
            {
                // Release the lease on the source blob
                await lease.ReleaseAsync();
            }
        }
        // </Snippet_CopyBlob>

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

        //-------------------------------------------------
        // Copy a snapshot over a base blob
        //-------------------------------------------------
        // <Snippet_CopySnapshot>
        public static async Task<BlobClient> CopySnapshotOverBaseBlobAsync(BlobClient blobClient, string snapshotTimestamp)
        {
            // Instantiate BlobClient with identical URI and add snapshot timestamp
            BlobClient blobSnapshotClient = blobClient.WithSnapshot(snapshotTimestamp);

            // Restore the specified snapshot by copying it over the base blob
            CopyFromUriOperation copyOperation = await blobClient.StartCopyFromUriAsync(blobSnapshotClient.Uri);
            await copyOperation.WaitForCompletionAsync();

            // Return the client object after the copy operation
            return blobClient;
        }
        // </Snippet_CopySnapshot>

        //-------------------------------------------------
        // Copy a previous version over a base blob
        //-------------------------------------------------
        // <Snippet_CopyVersion>
        public static async Task<BlobClient> CopyVersionOverBaseBlobAsync(BlobClient blobClient, string versionTimestamp)
        {
            // Instantiate BlobClient with identical URI and add version timestamp
            BlobClient blobVersionClient = blobClient.WithVersion(versionTimestamp);

            // Restore the specified snapshot by copying it over the base blob
            CopyFromUriOperation copyOperation = await blobClient.StartCopyFromUriAsync(blobVersionClient.Uri);
            await copyOperation.WaitForCompletionAsync();

            // Return the client object after the copy operation
            return blobClient;
        }
        // </Snippet_CopyVersion>

        //-------------------------------------------------
        // Rehydrate a blob using a copy operation
        //-------------------------------------------------
        // <Snippet_RehydrateUsingCopy>
        public static async Task RehydrateBlobUsingCopyAsync(BlobServiceClient blobServiceClient)
        {
            // Instantiate BlobClient for the source blob and destination blob
            BlobClient sourceBlob = blobServiceClient
                .GetBlobContainerClient("source-container")
                .GetBlobClient("sample-blob-archive.txt");
            BlobClient destinationBlob = blobServiceClient
                .GetBlobContainerClient("source-container")
                .GetBlobClient("sample-blob.txt");

            // Configure copy options to specify hot tier and standard priority
            BlobCopyFromUriOptions copyOptions = new()
            {
                AccessTier = AccessTier.Hot,
                RehydratePriority = RehydratePriority.Standard
            };

            // Copy source blob from archive tier to destination blob in hot tier
            CopyFromUriOperation copyOperation = await destinationBlob.StartCopyFromUriAsync(sourceBlob.Uri, copyOptions);
            await copyOperation.WaitForCompletionAsync();
        }
        // </Snippet_RehydrateUsingCopy>
    }
}
