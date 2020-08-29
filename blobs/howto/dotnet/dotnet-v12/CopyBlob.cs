using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class CopyBlob
    {
        //-------------------------------------------------
        // Copy a blob
        //-------------------------------------------------
        // <Snippet_CopyBlob>
        private static async Task CopyBlobAsync(BlobContainerClient container)
        {
            try
            {
                // Get the name of the first blob in the container to use as the source.
                string blobName = container.GetBlobs().FirstOrDefault().Name;

                // Create a BlobClient representing the source blob to copy.
                BlobClient sourceBlob = container.GetBlobClient(blobName);

                // Lease the source blob for the copy operation to prevent another client from modifying it.
                // Specifying -1 for the lease interval creates an infinite lease.
                BlobLeaseClient lease = sourceBlob.GetBlobLeaseClient();
                await lease.AcquireAsync(TimeSpan.FromSeconds(-1));

                // Get the destination blob's properties before checking the copy state.
                BlobProperties sourceProperties = await sourceBlob.GetPropertiesAsync();

                Console.WriteLine($"Lease state: {sourceProperties.LeaseState}");

                // Get a reference to a destination blob (in this case, a new blob).
                BlobClient destBlob = container.GetBlobClient(sourceBlob.Name + Guid.NewGuid());

                // Ensure that the source blob exists.
                if (await sourceBlob.ExistsAsync())
                {
                    // Start the copy operation.
                    await destBlob.StartCopyFromUriAsync(sourceBlob.Uri);

                    // Get the destination blob's properties before checking the copy state.
                    BlobProperties destProperties = await destBlob.GetPropertiesAsync();

                    Console.WriteLine($"Copy status: {destProperties.CopyStatus}");
                    Console.WriteLine($"Copy progress: {destProperties.CopyProgress}");
                    Console.WriteLine($"Completion time: {destProperties.CopyCompletedOn}");
                    Console.WriteLine($"Total bytes: {destProperties.ContentLength}");
                }

                // Break the lease on the source blob.
                if (sourceBlob != null)
                {
                    // Update the destination blob's properties.
                    sourceProperties = await sourceBlob.GetPropertiesAsync();

                    if (sourceProperties.LeaseState == LeaseState.Leased)
                    {
                        await lease.BreakAsync();

                        // Update the destination blob's properties to check the lease state.
                        sourceProperties = await sourceBlob.GetPropertiesAsync();
                        Console.WriteLine($"Lease state: {sourceProperties.LeaseState}");
                    }
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
        // </Snippet_CopyBlob>

        //-------------------------------------------------
        // Sop a blob copy operation
        //-------------------------------------------------
        private static async Task StopBlobCopyAsync(BlobContainerClient container)
        {
            try
            {
                // Get the name of the first blob in the container to use as the source.
                string blobName = container.GetBlobs().FirstOrDefault().Name;

                // Create a BlobClient representing the source blob to copy.
                BlobClient sourceBlob = container.GetBlobClient(blobName);

                // Lease the source blob for the copy operation to prevent another client from modifying it.
                // Specifying -1 for the lease interval creates an infinite lease.
                BlobLeaseClient lease = sourceBlob.GetBlobLeaseClient();
                await lease.AcquireAsync(TimeSpan.FromSeconds(-1));

                // Get the destination blob's properties to check the lease state.
                BlobProperties sourceProperties = await sourceBlob.GetPropertiesAsync();
                Console.WriteLine($"Lease state: {sourceProperties.LeaseState}");

                // Get a reference to a destination blob (in this case, a new blob).
                BlobClient destBlob = container.GetBlobClient(sourceBlob.Name + Guid.NewGuid());

                // Ensure that the source blob exists.
                if (await sourceBlob.ExistsAsync())
                {
                    // Start the copy operation.
                    destBlob.StartCopyFromUri(sourceBlob.Uri);

                    // <Snippet_StopBlobCopy>
                    // Get the destination blob's properties before checking the copy state.
                    BlobProperties destProperties = destBlob.GetProperties();

                    // Check the copy status. If it is still pending, abort the copy operation.
                    if (destProperties.CopyStatus == CopyStatus.Pending)
                    {
                        await destBlob.AbortCopyFromUriAsync(destProperties.CopyId);
                        Console.WriteLine($"Copy operation {destProperties.CopyId} has been aborted.");
                    }
                    // </Snippet_StopBlobCopy>
                    else
                    { 
                        Console.WriteLine($"Copy status: {destProperties.CopyStatus}");
                        Console.WriteLine($"Copy progress: {destProperties.CopyProgress}");
                        Console.WriteLine($"Completion time: {destProperties.CopyCompletedOn}");
                        Console.WriteLine($"Total bytes: {destProperties.ContentLength}");
                    }
                }

                // Break the lease on the source blob.
                if (sourceBlob != null)
                {
                    // Update the destination blob's properties before checking the copy state.
                    sourceProperties = await sourceBlob.GetPropertiesAsync();

                    if (sourceProperties.LeaseState == LeaseState.Leased)
                    {
                        await lease.BreakAsync();

                        // Update the destination blob's properties to check the lease state.
                        sourceProperties = await sourceBlob.GetPropertiesAsync();
                        Console.WriteLine($"Lease state: {sourceProperties.LeaseState}");
                    }
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }

        public async Task<bool> MenuAsync()
        {
            var connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
            BlobContainerClient container = blobServiceClient.GetBlobContainerClient(Constants.containerName);

            Console.Clear();
            Console.WriteLine("Choose a blob copy scenario:");
            Console.WriteLine("1) Copy an existing blob");
            Console.WriteLine("2) Stop blob copy operation");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                    await CopyBlobAsync(container);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":
                    await StopBlobCopyAsync(container);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "x":
                case "X":
                    return false;

                default:
                    return true;
            }
        }
    }
}
