using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace BlobDevGuideBlobs
{
    class AccessTiers
    {
        //-------------------------------------------------
        // Change a blob's access tier
        //-------------------------------------------------
        // <Snippet_ChangeAccessTier>
        public static async Task ChangeBlobAccessTierAsync(
            BlobClient blobClient)
        {
            // Change the access tier of the blob to cool
            await blobClient.SetAccessTierAsync(AccessTier.Cool);
        }
        // </Snippet_ChangeAccessTier>

        //-------------------------------------------------
        // Rehydrate a blob using a copy operation
        //-------------------------------------------------
        // <Snippet_RehydrateUsingCopy>
        public static async Task RehydrateBlobUsingCopyAsync(
            BlobClient sourceArchiveBlob,
            BlobClient destinationRehydratedBlob)
        {
            // Note: the destination blob must have a different name than the archived source blob

            // Configure copy options to specify hot tier and standard priority
            BlobCopyFromUriOptions copyOptions = new()
            {
                AccessTier = AccessTier.Hot,
                RehydratePriority = RehydratePriority.Standard
            };

            // Copy source blob from archive tier to destination blob in hot tier
            CopyFromUriOperation copyOperation = await destinationRehydratedBlob
                .StartCopyFromUriAsync(sourceArchiveBlob.Uri, copyOptions);
            await copyOperation.WaitForCompletionAsync();
        }
        // </Snippet_RehydrateUsingCopy>
    }
}
