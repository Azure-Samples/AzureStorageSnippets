package com.blobs.devguide.blobs;

import com.azure.storage.blob.*;
import com.azure.storage.blob.specialized.*;

public class BlobLease {
    // <Snippet_AcquireLease>
    public BlobLeaseClient acquireBlobLease(BlobClient blob) {
        // Create the lease client
        BlobLeaseClient leaseClient = new BlobLeaseClientBuilder()
                .blobClient(blob)
                .buildClient();

        // Acquire the lease - specify duration between 15 and 60 seconds, or -1 for
        // infinite duration
        String leaseID = leaseClient.acquireLease(30);
        System.out.printf("Acquired lease ID: %s%n", leaseID);

        return leaseClient;
    }
    // </Snippet_AcquireLease>

    // <Snippet_RenewLease>
    public void renewBlobLease(BlobLeaseClient leaseClient) {
        leaseClient.renewLease();
    }
    // </Snippet_RenewLease>

    // <Snippet_ReleaseLease>
    public void releaseBlobLease(BlobLeaseClient leaseClient) {
        leaseClient.releaseLease();
        System.out.println("Release lease operation completed");
    }
    // </Snippet_ReleaseLease>

    // <Snippet_BreakLease>
    public void breakBlobLease(BlobLeaseClient leaseClient) {
        leaseClient.breakLease();
    }
    // </Snippet_BreakLease>
}