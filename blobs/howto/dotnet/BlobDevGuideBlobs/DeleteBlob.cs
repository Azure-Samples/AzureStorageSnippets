using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

namespace BlobDevGuideBlobs
{
    class DeleteBlob
    {
        // <Snippet_DeleteBlob>
        public static async Task DeleteBlobAsync(BlobClient blob)
        {
            await blob.DeleteAsync();
        }
        // </Snippet_DeleteBlob>

        // <Snippet_DeleteBlobSnapshots>
        public static async Task DeleteBlobSnapshotsAsync(BlobClient blob)
        {
            // Delete a blob and all of its snapshots
            await blob.DeleteAsync(snapshotsOption: DeleteSnapshotsOption.IncludeSnapshots);

            // Delete only the blob's snapshots
            //await blob.DeleteAsync(snapshotsOption: DeleteSnapshotsOption.OnlySnapshots);
        }
        // </Snippet_DeleteBlobSnapshots>

        // <Snippet_RestoreBlob>
        public static async Task RestoreBlobsAsync(BlobContainerClient container)
        {
            foreach (BlobItem blob in container.GetBlobs(BlobTraits.None, BlobStates.Deleted))
            {
                await container.GetBlockBlobClient(blob.Name).UndeleteAsync();
            }
        }
        // </Snippet_RestoreBlob>

        // <Snippet_RestoreSnapshot>
        public static async Task RestoreSnapshotsAsync(
            BlobContainerClient container,
            BlobClient blob)
        {
            // Restore the deleted blob
            await blob.UndeleteAsync();

            // List blobs in this container that match prefix
            // Include snapshots in listing
            Pageable<BlobItem> blobItems = container.GetBlobs(
                BlobTraits.None,
                BlobStates.Snapshots,
                prefix: blob.Name);

            // Get the URI for the most recent snapshot
            BlobUriBuilder blobSnapshotUri = new BlobUriBuilder(blob.Uri)
            {
                Snapshot = blobItems
                    .OrderByDescending(snapshot => snapshot.Snapshot)
                    .ElementAtOrDefault(0)?.Snapshot
            };

            // Restore the most recent snapshot by copying it to the blob
            await blob.StartCopyFromUriAsync(blobSnapshotUri.ToUri());
        }
        // </Snippet_RestoreSnapshot>

        // <Snippet_RestoreBlobWithVersioning>
        public static void RestoreBlobWithVersioning(
            BlobContainerClient container,
            BlobClient blob)
        {
            // List blobs in this container that match prefix
            // Include versions in listing
            Pageable<BlobItem> blobItems = container.GetBlobs(
                BlobTraits.None,
                BlobStates.Version,
                prefix: blob.Name);

            // Get the URI for the most recent version
            BlobUriBuilder blobVersionUri = new BlobUriBuilder(blob.Uri)
            {
                VersionId = blobItems.
                    OrderByDescending(version => version.VersionId).
                    ElementAtOrDefault(0)?.VersionId
            };

            // Restore the most recently generated version by copying it to the base blob
            blob.StartCopyFromUri(blobVersionUri.ToUri());
        }
        // </Snippet_RestoreBlobWithVersioning>
    }
}
