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

                // Ensure that the source blob exists.
                if (await sourceBlob.ExistsAsync())
                {
                    // Lease the source blob for the copy operation 
                    // to prevent another client from modifying it.
                    BlobLeaseClient lease = sourceBlob.GetBlobLeaseClient();

                    // Specifying -1 for the lease interval creates an infinite lease.
                    await lease.AcquireAsync(TimeSpan.FromSeconds(-1));

                    // Get the source blob's properties and display the lease state.
                    BlobProperties sourceProperties = await sourceBlob.GetPropertiesAsync();
                    Console.WriteLine($"Lease state: {sourceProperties.LeaseState}");

                    // Get a BlobClient representing the destination blob with a unique name.
                    BlobClient destBlob = 
                        container.GetBlobClient(Guid.NewGuid() + "-" + sourceBlob.Name);

                    // Start the copy operation.
                    await destBlob.StartCopyFromUriAsync(sourceBlob.Uri);

                    // Get the destination blob's properties and display the copy status.
                    BlobProperties destProperties = await destBlob.GetPropertiesAsync();

                    Console.WriteLine($"Copy status: {destProperties.CopyStatus}");
                    Console.WriteLine($"Copy progress: {destProperties.CopyProgress}");
                    Console.WriteLine($"Completion time: {destProperties.CopyCompletedOn}");
                    Console.WriteLine($"Total bytes: {destProperties.ContentLength}");

                    // Update the source blob's properties.
                    sourceProperties = await sourceBlob.GetPropertiesAsync();

                    if (sourceProperties.LeaseState == LeaseState.Leased)
                    {
                        // Break the lease on the source blob.
                        await lease.BreakAsync();

                        // Update the source blob's properties to check the lease state.
                        sourceProperties = await sourceBlob.GetPropertiesAsync();
                        Console.WriteLine($"Lease state: {sourceProperties.LeaseState}");
                    }
                }
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine(ex.Message);
                Console.ReadLine();
                throw;
            }
        }
        // </Snippet_CopyBlob>

        //-------------------------------------------------
        // Stop a blob copy operation
        //-------------------------------------------------
        private static async Task StopBlobCopyAsync(BlobContainerClient container)
        {
            try
            {
                // Get the name of the first blob in the container to use as the source.
                string blobName = container.GetBlobs().FirstOrDefault().Name;

                // Create a BlobClient representing the source blob to copy.
                BlobClient sourceBlob = container.GetBlobClient(blobName);

                // Ensure that the source blob exists.
                if (await sourceBlob.ExistsAsync())
                {
                    // Get a BlobClient representing the destination blob with a unique name.
                    BlobClient destBlob = 
                        container.GetBlobClient(Guid.NewGuid() + "-" + sourceBlob.Name);

                    // Start the copy operation.
                    destBlob.StartCopyFromUri(sourceBlob.Uri);

                    // <Snippet_StopBlobCopy>
                    // Get the destination blob's properties to check the copy status.
                    BlobProperties destProperties = destBlob.GetProperties();

                    // Check the copy status. If the status is pending, abort the copy operation.
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
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine(ex.Message);
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
