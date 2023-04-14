using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

namespace BlobDevGuideBlobs
{
    class CopyVersion
    {
        //-------------------------------------------------
        // Copy a previous version over a base blob
        //-------------------------------------------------
        // <Snippet_CopyVersion>
        public static async Task<BlockBlobClient> CopyVersionOverBaseBlobAsync(
            BlockBlobClient client,
            string versionTimestamp)
        {
            // Instantiate BlobClient with identical URI and add version timestamp
            BlockBlobClient versionClient = client.WithVersion(versionTimestamp);

            // Restore the specified version by copying it over the base blob
            await client.SyncUploadFromUriAsync(versionClient.Uri);

            // Return the client object after the copy operation
            return client;
        }
        // </Snippet_CopyVersion>
    }
}
