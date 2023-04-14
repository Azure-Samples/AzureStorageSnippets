using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

namespace BlobDevGuideBlobs
{
    class CopySnapshot
    {
        //-------------------------------------------------
        // Copy a snapshot over a base blob
        //-------------------------------------------------
        // <Snippet_CopySnapshot>
        public static async Task<BlockBlobClient> CopySnapshotOverBaseBlobAsync(
            BlockBlobClient client,
            string snapshotTimestamp)
        {
            // Instantiate BlockBlobClient with identical URI and add snapshot timestamp
            BlockBlobClient snapshotClient = client.WithSnapshot(snapshotTimestamp);

            // Restore the specified snapshot by copying it over the base blob
            await client.SyncUploadFromUriAsync(snapshotClient.Uri, overwrite: true);

            // Return the client object after the copy operation
            return client;
        }
        // </Snippet_CopySnapshot>
    }
}
