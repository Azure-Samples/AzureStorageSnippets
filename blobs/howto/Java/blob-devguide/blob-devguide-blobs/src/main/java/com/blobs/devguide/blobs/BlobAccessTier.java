package com.blobs.devguide.blobs;

import com.azure.core.util.polling.LongRunningOperationStatus;
import com.azure.core.util.polling.PollResponse;
import com.azure.core.util.polling.SyncPoller;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.options.BlobBeginCopyOptions;

public class BlobAccessTier {
    // <Snippet_ChangeAccessTier>
    public void changeBlobAccessTier(BlobClient blobClient) {
        // Change the blob's access tier to cool
        blobClient.setAccessTier(AccessTier.COOL);
    }
    // </Snippet_ChangeAccessTier>

    // <Snippet_RehydrateUsingSetAccessTier>
    public void rehydrateBlobSetAccessTier(BlobClient blobClient) {
        // Rehydrate the blob to hot tier using a standard rehydrate priority
        blobClient.setAccessTierWithResponse(
            AccessTier.HOT,
            RehydratePriority.STANDARD,
            null, 
            null, 
            null);
    }
    // </Snippet_RehydrateUsingSetAccessTier>

    // <Snippet_RehydrateUsingCopy>
    public void rehydrateBlobUsingCopy(
        BlobClient sourceArchiveBlob,
        BlobClient destinationRehydratedBlob) {
        // Note: the destination blob must have a different name than the archived source blob

        // Start the copy operation and wait for it to complete
        final SyncPoller<BlobCopyInfo, Void> poller = destinationRehydratedBlob.beginCopy(
                new BlobBeginCopyOptions(sourceArchiveBlob.getBlobUrl())
                        .setTier(AccessTier.HOT)
                        .setRehydratePriority(RehydratePriority.STANDARD));
                        
        PollResponse<BlobCopyInfo> response = poller
                .waitUntil(LongRunningOperationStatus.SUCCESSFULLY_COMPLETED);
    }
    // </Snippet_RehydrateUsingCopy>
}
