package com.blobs.devguide.blobs;

import com.azure.core.util.polling.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.options.*;
import com.azure.storage.blob.specialized.*;

import java.time.*;
import java.util.*;

public class BlobCopy {
    // <Snippet_CopyBlobURL>
    public void copyBlob_copyFromUrl(BlobServiceClient blobServiceClient) {
        // Get the source blob as a BlobClient object
        BlobClient sourceBlob = blobServiceClient.getBlobContainerClient("sample-container")
                .getBlobClient("sampleBlob.txt");

        // Make sure the source blob exists before attempting to copy
        if (sourceBlob.exists()) {
            BlobClient destBlob = blobServiceClient.getBlobContainerClient("different-sample-container")
                    .getBlobClient("sampleBlob.txt");

            // Lease the source blob during copy to prevent other clients from modifying it
            BlobLeaseClient lease = new BlobLeaseClientBuilder()
                    .blobClient(sourceBlob)
                    .buildClient();

            // Specifying -1 creates an infinite lease
            lease.acquireLease(-1);

            // Get the source blob properties
            BlobProperties sourceBlobProps = sourceBlob.getProperties();
            System.out.printf("Source blob lease state: %s%n", sourceBlobProps.getLeaseState().toString());

            // Begin the copy operation
            destBlob.copyFromUrl(sourceBlob.getBlobUrl());

            // Get the destination blob properties
            BlobProperties destBlobProps = destBlob.getProperties();
            System.out.printf("Copy status: %s%n", destBlobProps.getCopyStatus());
            System.out.printf("Copy progress: %s%n", destBlobProps.getCopyProgress());
            System.out.printf("Copy completion time: %s%n", destBlobProps.getCopyCompletionTime());
            System.out.printf("Total bytes copied: %d%n", destBlobProps.getBlobSize());

            // Break the lease on the source blob
            if (sourceBlobProps.getLeaseState() == LeaseStateType.LEASED) {
                lease.breakLease();

                // Display updated lease state
                sourceBlobProps = sourceBlob.getProperties();
                System.out.printf("Source blob lease state: %s%n", sourceBlobProps.getLeaseState().toString());
            }
        } else {
            System.out.println("Source blob does not exist");
        }
    }
    // </Snippet_CopyBlobURL>

    // <Snippet_CopyBlobBeginCopy>
    public void copyBlob_beginCopy(BlobServiceClient blobServiceClient) {
        // Get the source blob as a BlobClient object
        BlobClient sourceBlob = blobServiceClient.getBlobContainerClient("sample-container")
                .getBlobClient("sampleBlob.txt");

        // Make sure the source blob exists before attempting to copy
        if (sourceBlob.exists()) {
            // Lease the source blob during copy to prevent other client from modifying it
            BlobLeaseClient lease = new BlobLeaseClientBuilder()
                    .blobClient(sourceBlob)
                    .buildClient();

            // Specifying -1 creates an infinite lease - we'll break the lease when the copy
            // operation is finished
            lease.acquireLease(-1);

            // Get the source blob properties
            BlobProperties sourceBlobProps = sourceBlob.getProperties();
            System.out.printf("Source blob lease state: %s%n", sourceBlobProps.getLeaseState().toString());

            BlobClient destBlob = blobServiceClient.getBlobContainerClient("different-sample-container")
                    .getBlobClient("sampleBlob.txt");

            final SyncPoller<BlobCopyInfo, Void> poller = destBlob.beginCopy(sourceBlob.getBlobUrl(),
                    Duration.ofSeconds(2));
            PollResponse<BlobCopyInfo> pollResponse = poller.poll();
            System.out.printf("Copy identifier: %s%n", pollResponse.getValue().getCopyId());

            // Break the lease on the source blob
            if (sourceBlobProps.getLeaseState() == LeaseStateType.LEASED) {
                lease.breakLease();

                // Display updated lease state
                sourceBlobProps = sourceBlob.getProperties();
                System.out.printf("Source blob lease state: %s%n", sourceBlobProps.getLeaseState().toString());
            }
        } else {
            System.out.println("Source blob does not exist");
        }
    }
    // </Snippet_CopyBlobBeginCopy>

    // <Snippet_CopyBlobOptions>
    public void copyBlobWithOptions(BlobServiceClient blobServiceClient) {
        // Get the source blob as a BlobClient object
        BlobClient sourceBlob = blobServiceClient.getBlobContainerClient("sample-container")
                .getBlobClient("sampleBlob.txt");

        // Make sure the source blob exists before attempting to copy
        if (sourceBlob.exists()) {
            BlobClient destBlob = blobServiceClient.getBlobContainerClient("different-sample-container")
                    .getBlobClient("sampleBlob.txt");

            // Lease the destination blob before copying to prevent other clients from
            // modifying it
            BlobLeaseClient destBlobLease = new BlobLeaseClientBuilder()
                    .blobClient(destBlob)
                    .buildClient();

            // Specifying -1 creates an infinite lease - we'll break the lease when the copy
            // operation is finished
            destBlobLease.acquireLease(-1);

            // Get the source blob properties
            BlobProperties destBlobProps = sourceBlob.getProperties();

            // Add metadata or tags while copying to the destination blob
            Map<String, String> metadata = Collections.singletonMap("metadata", "value");
            Map<String, String> tags = Collections.singletonMap("tag", "value");

            // Add a condition to only copy if the source blob has not been modified for 7
            // days
            BlobBeginCopySourceRequestConditions modifiedRequestConditions = new BlobBeginCopySourceRequestConditions()
                    .setIfUnmodifiedSince(OffsetDateTime.now().minusDays(7));

            // Pass in the destination blob lease ID as part of the copy request
            BlobRequestConditions blobRequestConditions = new BlobRequestConditions()
                    .setLeaseId(destBlobLease.getLeaseId());

            SyncPoller<BlobCopyInfo, Void> poller = destBlob.beginCopy(new BlobBeginCopyOptions(sourceBlob.getBlobUrl())
                    .setMetadata(metadata)
                    .setTags(tags)
                    .setTier(AccessTier.HOT)
                    .setRehydratePriority(RehydratePriority.STANDARD)
                    .setSourceRequestConditions(modifiedRequestConditions)
                    .setDestinationRequestConditions(blobRequestConditions)
                    .setPollInterval(Duration.ofSeconds(2)));

            PollResponse<BlobCopyInfo> response = poller.waitUntil(LongRunningOperationStatus.SUCCESSFULLY_COMPLETED);
            System.out.printf("Copy identifier: %s%n", response.getValue().getCopyId());

            // Break the lease on the source blob
            if (destBlobProps.getLeaseState() == LeaseStateType.LEASED) {
                destBlobLease.breakLease();

                // Display updated lease state
                destBlobProps = destBlob.getProperties();
                System.out.printf("Source blob lease state: %s%n", destBlobProps.getLeaseState().toString());
            }
        } else {
            System.out.println("Source blob does not exist");
        }
    }
    // </Snippet_CopyBlobOptions>

    // <Snippet_AbortCopy>
    public void abortCopy(BlobServiceClient blobServiceClient) {
        // Get the destination blob and its properties
        BlobClient destBlob = blobServiceClient.getBlobContainerClient("different-sample-container")
                .getBlobClient("sampleBlob.txt");
        BlobProperties destBlobProps = destBlob.getProperties();

        // Check the copy status and abort if pending
        if (destBlobProps.getCopyStatus() == CopyStatusType.PENDING) {
            destBlob.abortCopyFromUrl(destBlobProps.getCopyId());
            System.out.printf("Copy operation %s has been aborted%n", destBlobProps.getCopyId());
        }
    }
    // </Snippet_AbortCopy>
}
