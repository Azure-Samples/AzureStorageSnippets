using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;

namespace BlobDevGuideBlobs
{
    class PutBlobFromURL
    {
        // <Snippet_CopyWithinAccount_PutBlobFromURL>
        //-------------------------------------------------
        // Copy a blob from the same storage account
        //-------------------------------------------------
        public static async Task CopyWithinStorageAccountAsync(
            BlobClient sourceBlob,
            BlockBlobClient destinationBlob)
        {
            // Get the source blob URI and create the destination blob
            // overwrite param defaults to false
            await destinationBlob.SyncUploadFromUriAsync(sourceBlob.Uri/*, overwrite: false*/);
        }
        // </Snippet_CopyWithinAccount_PutBlobFromURL>

        // <Snippet_CopyAcrossAccounts_PutBlobFromURL>
        //-------------------------------------------------
        // Copy a blob from a different storage account
        //-------------------------------------------------
        public static async Task CopyAcrossStorageAccountsAsync(
            BlobClient sourceBlob,
            BlockBlobClient destinationBlob)
        {
            // Note: to use GenerateSasUri() for the source blob, the
            // source blob client must be authorized via account key

            // Set the SAS token to expire in 60 minutes, as an example
            DateTimeOffset expiresOn = DateTimeOffset.UtcNow.AddMinutes(60);

            // Create a Uri object with a SAS token appended - specify Read (r) permissions
            Uri sourceBlobSASURI = sourceBlob.GenerateSasUri(BlobSasPermissions.Read, expiresOn);

            // Get the source blob URI and create the destination blob
            // overwrite param defaults to false
            await destinationBlob.SyncUploadFromUriAsync(sourceBlobSASURI/*, overwrite: false*/);
        }
        // </Snippet_CopyAcrossAccounts_PutBlobFromURL>

        // <Snippet_CopyFromExternalSource_PutBlobFromURL>
        //-------------------------------------------------
        // Copy a blob from an external source
        //-------------------------------------------------
        public static async Task CopyFromExternalSourceAsync(
            string sourceLocation,
            BlockBlobClient destinationBlob)
        {
            Uri sourceUri = new(sourceLocation);

            // Create the destination blob from the source URL
            // overwrite param defaults to false
            await destinationBlob.SyncUploadFromUriAsync(sourceUri/*, overwrite: false*/);
        }
        // </Snippet_CopyFromExternalSource_PutBlobFromURL>

    }
}
