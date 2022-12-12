package com.blobs.devguide.containers;

import com.azure.storage.blob.*;
import com.azure.storage.blob.specialized.*;

public class ContainerLease {
    // <Snippet_AcquireLeaseContainer>
    public BlobLeaseClient acquireContainerLease(BlobContainerClient container) {
        // Create the lease client
        BlobLeaseClient leaseClient = new BlobLeaseClientBuilder()
                .containerClient(container)
                .buildClient();

        // Acquire the lease - specify duration between 15 and 60 seconds, or -1 for
        // infinite duration
        String leaseID = leaseClient.acquireLease(30);
        System.out.printf("Acquired lease ID: %s%n", leaseID);

        return leaseClient;
    }
    // </Snippet_AcquireLeaseContainer>

    // <Snippet_RenewLeaseContainer>
    public void renewContainerLease(BlobLeaseClient leaseClient) {
        leaseClient.renewLease();
    }
    // </Snippet_RenewLeaseContainer>

    // <Snippet_ReleaseLeaseContainer>
    public void releaseContainerLease(BlobLeaseClient leaseClient) {
        leaseClient.releaseLease();
        System.out.println("Release lease operation completed");
    }
    // </Snippet_ReleaseLeaseContainer>

    // <Snippet_BreakLeaseContainer>
    public void breakContainerLease(BlobLeaseClient leaseClient) {
        leaseClient.breakLease();
    }
    // </Snippet_BreakLeaseContainer>
}
