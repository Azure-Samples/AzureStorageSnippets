using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs;

namespace BlobDevGuideBlobs
{
    class RehydrateBlobUsingCopy
    {
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
