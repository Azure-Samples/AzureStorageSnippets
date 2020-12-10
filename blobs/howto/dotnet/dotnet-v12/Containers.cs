using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class Containers
    {
        #region CreateSampleContainerAsync
        //-------------------------------------------------
        // Create a container
        //-------------------------------------------------
        private static async Task<BlobContainerClient> CreateSampleContainerAsync(BlobServiceClient blobServiceClient)
        {
            // Name the sample container based on new GUID to ensure uniqueness.
            // The container name must be lowercase.
            string containerName = "container-" + Guid.NewGuid();

            try
            {
                // Create the container
                BlobContainerClient container = await blobServiceClient.CreateBlobContainerAsync(containerName);

                if (await container.ExistsAsync())
                {
                    Console.WriteLine("Created container {0}", container.Name);
                    return container;
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine("HTTP error code {0}: {1}",
                                    e.Status, e.ErrorCode);
                Console.WriteLine(e.Message);
            }

            return null;
        }
        #endregion

        #region CreateRootContainer
        //-------------------------------------------------
        // Create root container
        //-------------------------------------------------
        private static void CreateRootContainer(BlobServiceClient blobServiceClient)
        {
            try
            {
                // Create the root container or handle the exception if it already exists
                BlobContainerClient container =  blobServiceClient.CreateBlobContainer("$root");

                if (container.Exists())
                {
                    Console.WriteLine("Created root container.");
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine("HTTP error code {0}: {1}",
                                    e.Status, e.ErrorCode);
                Console.WriteLine(e.Message);
            }
        }
        #endregion

        #region ListContainers

        //-------------------------------------------------
        // List containers
        //-------------------------------------------------

        // <Snippet_ListContainers>
        async static Task ListContainers(BlobServiceClient blobServiceClient, 
                                        string prefix, 
                                        int? segmentSize)
        {
            try
            {
                // Call the listing operation and enumerate the result segment.
                var resultSegment = 
                    blobServiceClient.GetBlobContainersAsync(BlobContainerTraits.Metadata, prefix, default)
                    .AsPages(default, segmentSize);

                await foreach (Azure.Page<BlobContainerItem> containerPage in resultSegment)
                {
                    foreach (BlobContainerItem containerItem in containerPage.Values)
                    {
                        Console.WriteLine("Container name: {0}", containerItem.Name);
                    }

                    Console.WriteLine();
                }
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
        // </Snippet_ListContainers>

        #endregion


        #region DeleteSampleContainerAsync
        //-------------------------------------------------
        // Delete a container
        //-------------------------------------------------
        private static async Task DeleteSampleContainerAsync(BlobServiceClient blobServiceClient, string containerName)
        {
            BlobContainerClient container = blobServiceClient.GetBlobContainerClient(containerName);

            try
            {
                // Delete the specified container and handle the exception.
                await container.DeleteAsync();
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine("HTTP error code {0}: {1}",
                                    e.Status, e.ErrorCode);
                Console.WriteLine(e.Message);
                Console.ReadLine();
            }
        }
        #endregion

        #region DeleteContainersWithPrefixAsync
        //-------------------------------------------------
        // Delete all containers with the specified prefix
        //-------------------------------------------------
        private static async Task DeleteContainersWithPrefixAsync(BlobServiceClient blobServiceClient, string prefix)
        {
            Console.WriteLine("Delete all containers beginning with the specified prefix");

            try
            {
                foreach (BlobContainerItem container in blobServiceClient.GetBlobContainers())
                {
                    if (container.Name.StartsWith(prefix))
                    { 
                        Console.WriteLine("\tContainer:" + container.Name);
                        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(container.Name);
                        await containerClient.DeleteAsync();
                    }
                }

                Console.WriteLine();
            }
            catch (RequestFailedException e)
            {
                Console.WriteLine(e.Message);
                Console.ReadLine();
                throw;
            }
        }
        #endregion

        #region User menu
        // Local variable that persists through calls to MenuAsync()
        private string _containerName_ = "";

        //-------------------------------------------------
        // Containers menu (Can call asynchronous and synchronous methods)
        //-------------------------------------------------
        public async Task<bool> MenuAsync()
        {
            string connectionString = Constants.connectionString;
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            Console.Clear();
            Console.WriteLine("Choose a container scenario:");
            Console.WriteLine("1) Create a sample container");
            Console.WriteLine("2) Create root container");
            Console.WriteLine("3) Delete the sample container");
            Console.WriteLine("4) Delete containers with \"container-\" prefix");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                    BlobContainerClient container = await CreateSampleContainerAsync(blobServiceClient);

                    // Save the name of the container we create so we can delete it later.
                    _containerName_ = container.Name;

                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "2":
                    CreateRootContainer(blobServiceClient);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "3":
                    await ListContainers(blobServiceClient, string.Empty, 1000);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "4":
                    // Delete the container created in the call to CreateSampleContainerAsync()
                    await DeleteSampleContainerAsync(blobServiceClient, _containerName_);
                    Console.WriteLine("Press enter to continue");
                    Console.ReadLine();
                    return true;

                case "5":
                    await DeleteContainersWithPrefixAsync(blobServiceClient, "container-");
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
        #endregion
    }
}
