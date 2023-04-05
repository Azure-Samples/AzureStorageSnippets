using System;
using System.IO;
using System.Net;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;

namespace dotnet_v12
{
    public class Concurrency
    {

        #region DemonstrateOptimisticConcurrencyBlob

        //------------------------------------------------------------------
        // Demonstrate optimistic concurrency for write operations to a blob
        //------------------------------------------------------------------

        // <Snippet_DemonstrateOptimisticConcurrencyBlob>
        private static async Task DemonstrateOptimisticConcurrencyBlob(BlobClient blobClient)
        {
            Console.WriteLine("Demonstrate optimistic concurrency");

            try
            {
                // Download a blob
                Response<BlobDownloadResult> response = await blobClient.DownloadContentAsync();
                BlobDownloadResult downloadResult = response.Value;
                string blobContents = downloadResult.Content.ToString();

                ETag originalETag = downloadResult.Details.ETag;
                Console.WriteLine("Blob ETag = {0}", originalETag);

                // This function simulates an external change to the blob after we've fetched it
                // The external change updates the contents of the blob and the ETag value
                await SimulateExternalBlobChangesAsync(blobClient);

                // Now try to update the blob using the original ETag value
                string blobContentsUpdate2 = $"{blobContents} Update 2. If-Match condition set to original ETag.";

                // Set the If-Match condition to the original ETag
                BlobUploadOptions blobUploadOptions = new()
                {
                    Conditions = new BlobRequestConditions()
                    {
                        IfMatch = originalETag
                    }
                };

                // This call should fail with error code 412 (Precondition Failed)
                BlobContentInfo blobContentInfo =
                    await blobClient.UploadAsync(BinaryData.FromString(blobContentsUpdate2), blobUploadOptions);
            }
            catch (RequestFailedException e) when (e.Status == (int)HttpStatusCode.PreconditionFailed)
            {
                Console.WriteLine(
                    @"Blob's ETag does not match ETag provided. Fetch the blob to get updated contents and properties.");
            }
        }

        private static async Task SimulateExternalBlobChangesAsync(BlobClient blobClient)
        {
            // Simulates an external change to the blob for this example

            // Download a blob
            Response<BlobDownloadResult> response = await blobClient.DownloadContentAsync();
            BlobDownloadResult downloadResult = response.Value;
            string blobContents = downloadResult.Content.ToString();

            // Update the existing block blob contents
            // No ETag condition is provided, so original blob is overwritten and ETag is updated
            string blobContentsUpdate1 = $"{blobContents} Update 1";
            BlobContentInfo blobContentInfo =
                await blobClient.UploadAsync(BinaryData.FromString(blobContentsUpdate1), overwrite: true);
            Console.WriteLine("Blob update. Updated ETag = {0}", blobContentInfo.ETag);
        }
        // </Snippet_DemonstrateOptimisticConcurrencyBlob>

        #endregion

        #region DemonstratePessimisticConcurrencyBlob

        //-------------------------------------------------
        // Demonstrate pessimistic concurrency for write operations to a blob
        //-------------------------------------------------

        // <Snippet_DemonstratePessimisticConcurrencyBlob>
        public static async Task DemonstratePessimisticConcurrencyBlob(BlobClient blobClient)
        {
            Console.WriteLine("Demonstrate pessimistic concurrency");

            BlobContainerClient containerClient = blobClient.GetParentBlobContainerClient();
            BlobLeaseClient blobLeaseClient = blobClient.GetBlobLeaseClient();

            try
            {
                // Create the container if it does not exist.
                await containerClient.CreateIfNotExistsAsync();

                // Upload text to a blob.
                string blobContents1 = "First update. Overwrite blob if it exists.";
                byte[] byteArray = Encoding.ASCII.GetBytes(blobContents1);
                using (MemoryStream stream = new MemoryStream(byteArray))
                {
                    BlobContentInfo blobContentInfo = await blobClient.UploadAsync(stream, overwrite: true);
                }

                // Acquire a lease on the blob.
                BlobLease blobLease = await blobLeaseClient.AcquireAsync(TimeSpan.FromSeconds(15));
                Console.WriteLine("Blob lease acquired. LeaseId = {0}", blobLease.LeaseId);

                // Set the request condition to include the lease ID.
                BlobUploadOptions blobUploadOptions = new BlobUploadOptions()
                {
                    Conditions = new BlobRequestConditions()
                    {
                        LeaseId = blobLease.LeaseId
                    }
                };

                // Write to the blob again, providing the lease ID on the request.
                // The lease ID was provided, so this call should succeed.
                string blobContents2 = "Second update. Lease ID provided on request.";
                byteArray = Encoding.ASCII.GetBytes(blobContents2);

                using (MemoryStream stream = new MemoryStream(byteArray))
                {
                    BlobContentInfo blobContentInfo = await blobClient.UploadAsync(stream, blobUploadOptions);
                }

                // This code simulates an update by another client.
                // The lease ID is not provided, so this call fails.
                string blobContents3 = "Third update. No lease ID provided.";
                byteArray = Encoding.ASCII.GetBytes(blobContents3);

                using (MemoryStream stream = new MemoryStream(byteArray))
                {
                    // This call should fail with error code 412 (Precondition Failed).
                    BlobContentInfo blobContentInfo = await blobClient.UploadAsync(stream);
                }
            }
            catch (RequestFailedException e)
            {
                if (e.Status == (int)HttpStatusCode.PreconditionFailed)
                {
                    Console.WriteLine(
                        @"Precondition failure as expected. The lease ID was not provided.");
                }
                else
                {
                    Console.WriteLine(e.Message);
                    throw;
                }
            }
            finally
            {
                await blobLeaseClient.ReleaseAsync();
            }
        }
        // </Snippet_DemonstratePessimisticConcurrencyBlob>

        #endregion

        public async Task<bool> MenuAsync()
        {
            Console.Clear();
            Console.WriteLine("Choose a concurrency scenario:");
            Console.WriteLine("1) Demonstrate optimistic concurrency");
            Console.WriteLine("2) Demonstrate pessimistic concurrency");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                { 
                    Uri blobUri = new Uri(string.Format("https://{0}.blob.core.windows.net/{1}/{2}",
                                                             Constants.storageAccountName,
                                                             Constants.containerName,
                                                             Constants.blobName));

                    BlobClient blobClient = new BlobClient(blobUri, new DefaultAzureCredential());

                    await DemonstrateOptimisticConcurrencyBlob(blobClient);

                    return true;
                }
                case "2":
                {
                    Uri blobUri = new Uri(string.Format("https://{0}.blob.core.windows.net/{1}/{2}",
                                                                Constants.storageAccountName,
                                                                Constants.containerName,
                                                                Constants.blobName));

                    BlobClient blobClient = new BlobClient(blobUri, new DefaultAzureCredential());

                    await DemonstratePessimisticConcurrencyBlob(blobClient);

                    return true;
                }
                case "x":
                case "X":

                    return false;

                default:

                    return true;

            }
        }
    }
}
