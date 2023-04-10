using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

namespace BlobDevGuideBlobs
{
    class LeaseBlob
    {
        // <Snippet_AcquireBlobLease>
        public static async Task<BlobLeaseClient> AcquireBlobLeaseAsync(
            BlobClient blobClient)
        {
            // Get a BlobLeaseClient object to work with a blob lease
            BlobLeaseClient leaseClient = blobClient.GetBlobLeaseClient();

            Response<BlobLease> response = 
                await leaseClient.AcquireAsync(duration: TimeSpan.FromSeconds(30));

            // Use response.Value to get information about the blob lease

            return leaseClient;
        }
        // </Snippet_AcquireBlobLease>

        // <Snippet_RenewBlobLease>
        public static async Task RenewBlobLeaseAsync(
            BlobClient blobClient,
            string leaseID)
        {
            // Get a BlobLeaseClient object to work with a blob lease
            BlobLeaseClient leaseClient = blobClient.GetBlobLeaseClient(leaseID);

            await leaseClient.RenewAsync();
        }
        // </Snippet_RenewBlobLease>

        // <Snippet_ReleaseBlobLease>
        public static async Task ReleaseBlobLeaseAsync(
            BlobClient blobClient,
            string leaseID)
        {
            // Get a BlobLeaseClient object to work with a blob lease
            BlobLeaseClient leaseClient = blobClient.GetBlobLeaseClient(leaseID);

            await leaseClient.ReleaseAsync();
        }
        // </Snippet_ReleaseBlobLease>

        // <Snippet_BreakBlobLease>
        public static async Task BreakBlobLeaseAsync(
            BlobClient blobClient)
        {
            // Get a BlobLeaseClient object to work with a blob lease
            BlobLeaseClient leaseClient = blobClient.GetBlobLeaseClient();

            await leaseClient.BreakAsync();
        }
        // </Snippet_BreakBlobLease>
    }
}
