using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace BlobDevGuideBlobs
{
    class CopySnapshot
    {
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
    }
}
