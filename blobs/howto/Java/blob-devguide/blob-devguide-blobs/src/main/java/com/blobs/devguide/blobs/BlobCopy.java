package com.blobs.devguide.blobs;

import com.azure.core.util.polling.*;
import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.options.*;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
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

    // <Snippet_CopyFromAzure_PutBlobFromURL>
    public void copyFromSourceInAzure(BlobClient sourceBlob, BlockBlobClient destinationBlob) {
        // Get the source blob URL and create the destination blob
        // set overwrite param to true if you want to overwrite an existing blob
        destinationBlob.uploadFromUrl(sourceBlob.getBlobUrl(), false);
    }
    // </Snippet_CopyFromAzure_PutBlobFromURL>

    // <Snippet_CopyFromExternalSource_PutBlobFromURL>
    public void copyFromExternalSource(String sourceURL, BlockBlobClient destinationBlob) {
        // Create the destination blob from the source URL
        // set overwrite param to true if you want to overwrite an existing blob
        destinationBlob.uploadFromUrl(sourceURL, false);
    }
    // </Snippet_CopyFromExternalSource_PutBlobFromURL>

    // <Snippet_CopyWithinStorageAccount_CopyBlob>
    public void copyBlobWithinStorageAccount(BlobClient sourceBlob, BlockBlobClient destinationBlob) {
        // Lease the source blob to prevent changes during the copy operation
        BlobLeaseClient lease = new BlobLeaseClientBuilder()
                .blobClient(sourceBlob)
                .buildClient();

        try {
            // Specifying -1 creates an infinite lease
            lease.acquireLease(-1);

            // Start the copy operation and wait for it to complete
            final SyncPoller<BlobCopyInfo, Void> poller = destinationBlob.beginCopy(
                    sourceBlob.getBlobUrl(),
                    Duration.ofSeconds(2));
            PollResponse<BlobCopyInfo> response = poller.waitUntil(LongRunningOperationStatus.SUCCESSFULLY_COMPLETED);
        } finally {
            // Release the lease once the copy operation completes
            lease.releaseLease();
        }
    }
    // </Snippet_CopyWithinStorageAccount_CopyBlob>

    // <Snippet_CopyAcrossStorageAccounts_CopyBlob>
    public void copyBlobAcrossStorageAccounts(BlobClient sourceBlob, BlockBlobClient destinationBlob) {
        // Lease the source blob during copy to prevent other clients from modifying it
        BlobLeaseClient lease = new BlobLeaseClientBuilder()
                .blobClient(sourceBlob)
                .buildClient();

        // Create a SAS token for the source blob or use an existing one
        String sasToken = generateUserDelegationSAS(
                sourceBlob.getContainerClient().getServiceClient(),
                sourceBlob);

        // Get the source blob URL and append the SAS token
        String sourceBlobSasURL = sourceBlob.getBlobUrl() + "?" + sasToken;

        try {
            // Specifying -1 creates an infinite lease
            lease.acquireLease(-1);

            // Start the copy operation and wait for it to complete
            final SyncPoller<BlobCopyInfo, Void> poller = destinationBlob.beginCopy(
                    sourceBlobSasURL,
                    Duration.ofSeconds(2));
            PollResponse<BlobCopyInfo> response = poller.waitUntil(LongRunningOperationStatus.SUCCESSFULLY_COMPLETED);
        } finally {
            // Release the lease once the copy operation completes
            lease.releaseLease();
        }
    }

    public String generateUserDelegationSAS(BlobServiceClient blobServiceClient, BlobClient sourceBlob) {
        // Get a user delegation key
        OffsetDateTime delegationKeyStartTime = OffsetDateTime.now();
        OffsetDateTime delegationKeyExpiryTime = OffsetDateTime.now().plusDays(1);
        UserDelegationKey key = blobServiceClient.getUserDelegationKey(
            delegationKeyStartTime,
            delegationKeyExpiryTime);

        // Create a SAS token that's valid for one day, as an example
        OffsetDateTime expiryTime = OffsetDateTime.now().plusDays(1);

        // Set the Read (r) permission on the SAS token
        BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);

        BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(expiryTime, permission)
                .setStartTime(OffsetDateTime.now());

        // Create a SAS token that's valid for one day
        String sasToken = sourceBlob.generateUserDelegationSas(sasValues, key);

        return sasToken;
    }
    // </Snippet_CopyAcrossStorageAccounts_CopyBlob>

    // <Snippet_CopyFromExternalSource_CopyBlob>
    public void copyFromExternalSourceAsyncScheduling(String sourceURL, BlockBlobClient destinationBlob) {
        // Start the copy operation and wait for it to complete
        final SyncPoller<BlobCopyInfo, Void> poller = destinationBlob.beginCopy(
                sourceURL,
                Duration.ofSeconds(2));
        PollResponse<BlobCopyInfo> response = poller.waitUntil(LongRunningOperationStatus.SUCCESSFULLY_COMPLETED);
    }
    // </Snippet_CopyFromExternalSource_CopyBlob>

    // <Snippet_CheckCopyStatus>
    public void checkCopyStatus(BlobCopyInfo copyInfo) {
        // Check the status of the copy operation 
        System.out.printf("Copy status", copyInfo.getCopyStatus());
    }
    // </Snippet_CheckCopyStatus>

    // <Snippet_AbortCopy>
    public void abortCopy(BlobCopyInfo copyInfo, BlobClient destinationBlob) {
        // Check the copy status and abort if pending
        if (copyInfo.getCopyStatus() == CopyStatusType.PENDING) {
            destinationBlob.abortCopyFromUrl(copyInfo.getCopyId());
            System.out.printf("Copy operation %s has been aborted%n", copyInfo.getCopyId());
        }
    }
    // </Snippet_AbortCopy>
}
