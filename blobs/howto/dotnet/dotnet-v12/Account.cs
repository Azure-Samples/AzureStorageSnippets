using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;
using System.Threading.Tasks;

namespace dotnet_v12
{
    class Account
    {
        // <Snippet_GetAccountInfo>
        private static async Task GetAccountInfoAsync(string connectStr)
        {
            try
            {
                BlobServiceClient blobServiceClient = new BlobServiceClient(connectStr);

                // Get the blob's storage account properties.
                AccountInfo acctInfo = await blobServiceClient.GetAccountInfoAsync();

                // Display the properties.
                Console.WriteLine("Account info");
                Console.WriteLine($" AccountKind: {acctInfo.AccountKind}");
                Console.WriteLine($"     SkuName: {acctInfo.SkuName}");
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"HTTP error code {ex.Status}: {ex.ErrorCode}");
                Console.WriteLine(ex.Message);
                Console.ReadLine();
            }
        }
        // </Snippet_GetAccountInfo>

        public async Task<bool> MenuAsync()
        {
            var connectionString = Constants.connectionString;

            Console.Clear();
            Console.WriteLine("Choose an account scenario:");
            Console.WriteLine("1) Get account info");
            Console.WriteLine("X) Exit to main menu");
            Console.Write("\r\nSelect an option: ");

            switch (Console.ReadLine())
            {
                case "1":
                    await GetAccountInfoAsync(connectionString);
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
