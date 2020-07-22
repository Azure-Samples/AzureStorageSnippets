using Azure.Storage.Blobs;
using System.Threading.Tasks;

namespace dotnet_v12
{
    public class Networking
    {
        //-------------------------------------------------
        // Configure TLS 1.2 on client
        //-------------------------------------------------

        // <Snippet_ConfigureTls12>
        public static async Task ConfigureTls12()
        {
            // Enable TLS 1.2 before connecting to Azure Storage
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;

            // Add your connection string here.
            string connectionString = "";

            // Create a new container with Shared Key authorization.
            BlobContainerClient containerClient = new BlobContainerClient(connectionString, "sample-container");
            await containerClient.CreateIfNotExistsAsync();
        }
        // </Snippet_ConfigureTls12>

    }
}
