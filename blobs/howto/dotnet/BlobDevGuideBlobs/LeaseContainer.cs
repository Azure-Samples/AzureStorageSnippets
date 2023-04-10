using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

namespace BlobDevGuideBlobs
{
    class LeaseContainer
    {
        // <Snippet_AcquireContainerLease>
        public static async Task<BlobLeaseClient> AcquireContainerLeaseAsync(
            BlobContainerClient containerClient)
        {
            // Get a BlobLeaseClient object to work with a container lease
            BlobLeaseClient leaseClient = containerClient.GetBlobLeaseClient();

            Response<BlobLease> response =
                await leaseClient.AcquireAsync(duration: TimeSpan.FromSeconds(30));

            // Use response.Value to get information about the container lease

            return leaseClient;
        }
        // </Snippet_AcquireContainerLease>

        // <Snippet_RenewContainerLease>
        public static async Task RenewContainerLeaseAsync(
            BlobContainerClient containerClient,
            string leaseID)
        {
            // Get a BlobLeaseClient object to work with a container lease
            BlobLeaseClient leaseClient = containerClient.GetBlobLeaseClient(leaseID);

            await leaseClient.RenewAsync();
        }
        // </Snippet_RenewContainerLease>

        // <Snippet_ReleaseContainerLease>
        public static async Task ReleaseContainerLeaseAsync(
            BlobContainerClient containerClient,
            string leaseID)
        {
            // Get a BlobLeaseClient object to work with a container lease
            BlobLeaseClient leaseClient = containerClient.GetBlobLeaseClient(leaseID);

            await leaseClient.ReleaseAsync();
        }
        // </Snippet_ReleaseContainerLease>

        // <Snippet_BreakContainerLease>
        public static async Task BreakContainerLeaseAsync(
            BlobContainerClient containerClient)
        {
            // Get a BlobLeaseClient object to work with a container lease
            BlobLeaseClient leaseClient = containerClient.GetBlobLeaseClient();

            await leaseClient.BreakAsync();
        }
        // </Snippet_BreakContainerLease>
    }
}
