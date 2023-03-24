using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;

namespace BlobDevGuide
{
    class CopyBlob
    {
        //-------------------------------------------------
        // Check blob copy status
        //-------------------------------------------------
        // <Snippet_CheckStatusCopyBlob>
        public static async Task CheckCopyStatusAsync(CopyFromUriOperation copyOperation)
        {
            // Check for the latest status of the copy operation
            Response response = await copyOperation.UpdateStatusAsync();

            // Parse the response to find x-ms-copy-status header
            if (response.Headers.TryGetValue("x-ms-copy-status", out string value))
                Console.WriteLine($"Copy status: {value}");
        }
        // </Snippet_CheckStatusCopyBlob>

        // <Snippet_CopyBlobWithinAccount>
        //-------------------------------------------------
        // Copy a blob from the same storage account
        //-------------------------------------------------
        public static async Task CopyBlobWithinAccountAsync(
            BlobClient sourceBlob,
            BlobClient destinationBlob)
        {
            // Lease the source blob to prevent changes during the copy operation
            BlobLeaseClient sourceBlobLease = new(sourceBlob);

            try
            {
                await sourceBlobLease.AcquireAsync(BlobLeaseClient.InfiniteLeaseDuration);

                // Start the copy operation and wait for it to complete
                CopyFromUriOperation copyOperation = 
                    await destinationBlob.StartCopyFromUriAsync(sourceBlob.Uri);
                await copyOperation.WaitForCompletionAsync();
            }
            catch (RequestFailedException ex)
            {
                // Handle the exception
            }
            finally
            {
                // Release the lease once the copy operation completes
                await sourceBlobLease.ReleaseAsync();
            }
        }
        // </Snippet_CopyBlobWithinAccount>

        // <Snippet_CopyBlobAcrossAccounts>
        //-------------------------------------------------
        // Copy a blob from a different storage account
        //-------------------------------------------------
        public static async Task CopyBlobAcrossAccountsAsync(
            BlobClient sourceBlob,
            BlobClient destinationBlob)
        {
            // Note: to use GenerateSasUri() for the source blob, the
            // source blob client must be authorized via account key

            // Set the SAS token to expire in 60 minutes, as an example
            DateTimeOffset expiresOn = DateTimeOffset.UtcNow.AddMinutes(60);

            // Create a Uri object with a SAS token appended - specify Read (r) permissions
            Uri sourceBlobSASURI = sourceBlob.GenerateSasUri(BlobSasPermissions.Read, expiresOn);

            // Start the copy operation and wait for it to complete
            CopyFromUriOperation copyOperation = await destinationBlob.StartCopyFromUriAsync(sourceBlobSASURI);
            await copyOperation.WaitForCompletionAsync();
        }
        // </Snippet_CopyBlobAcrossAccounts>

        //-------------------------------------------------
        // Abort a blob copy operation
        //-------------------------------------------------
        // <Snippet_AbortBlobCopy>
        public static async Task AbortBlobCopyAsync(
            CopyFromUriOperation copyOperation,
            BlobClient destinationBlob)
        {
            // Check for the latest status of the copy operation
            Response response = await copyOperation.UpdateStatusAsync();

            // Parse the response to find x-ms-copy-status header
            if (response.Headers.TryGetValue("x-ms-copy-status", out string value))
            {
                if (value == "pending")
                {
                    await destinationBlob.AbortCopyFromUriAsync(copyOperation.Id);
                    Console.WriteLine($"Copy operation {copyOperation.Id} aborted");
                }
            }
        }
        // </Snippet_AbortBlobCopy>

        //-------------------------------------------------
        // Copy a snapshot over a base blob
        //-------------------------------------------------
        // <Snippet_CopySnapshot>
        public static async Task<BlobClient> CopySnapshotOverBaseBlobAsync(BlobClient blobClient, string snapshotTimestamp)
        {
            // Instantiate BlobClient with identical URI and add snapshot timestamp
            BlobClient blobSnapshotClient = blobClient.WithSnapshot(snapshotTimestamp);

            // Restore the specified snapshot by copying it over the base blob
            CopyFromUriOperation copyOperation = await blobClient.StartCopyFromUriAsync(blobSnapshotClient.Uri);
            await copyOperation.WaitForCompletionAsync();

            // Return the client object after the copy operation
            return blobClient;
        }
        // </Snippet_CopySnapshot>

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
