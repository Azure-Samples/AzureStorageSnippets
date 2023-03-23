using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

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
        public static async Task CopyBlobAsync(Uri sourceBlobURI, BlobClient destinationBlob)
        {
            // Start the copy operation and wait for it to complete
            CopyFromUriOperation copyOperation = await destinationBlob.StartCopyFromUriAsync(sourceBlobURI);
            await copyOperation.WaitForCompletionAsync();
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
        public static async Task RehydrateBlobUsingCopyAsync(BlobClient sourceArchiveBlob, BlobClient destinationRehydratedBlob)
        {
            // Note that the destination blob must have a different name than the archived source blob

            // Configure copy options to specify hot tier and standard priority
            BlobCopyFromUriOptions copyOptions = new()
            {
                AccessTier = AccessTier.Hot,
                RehydratePriority = RehydratePriority.Standard
            };

            // Copy source blob from archive tier to destination blob in hot tier
            CopyFromUriOperation copyOperation = await destinationRehydratedBlob.StartCopyFromUriAsync(sourceArchiveBlob.Uri, copyOptions);
            await copyOperation.WaitForCompletionAsync();
        }
        // </Snippet_RehydrateUsingCopy>
    }
}
