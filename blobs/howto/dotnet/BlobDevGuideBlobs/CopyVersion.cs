using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace BlobDevGuideBlobs
{
    class CopyVersion
    {
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
    }
}
