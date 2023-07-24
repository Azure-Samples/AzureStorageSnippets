using Azure;
using Azure.Core;
using Azure.Identity;
using Azure.Storage;
using Azure.Storage.Files.DataLake;
using System;
using System.Collections.Generic;
using System.Text;

namespace dotnet_v12
{
    public static class Authorize_DataLake
    {
        //-------------------------------------------------------------
        // Connect to the storage account - get Data Lake service client
        //----------------------------------------------------------

        // <Snippet_AuthorizeWithKey>
        public static DataLakeServiceClient GetDataLakeServiceClient(string accountName, string accountKey)
        {
            StorageSharedKeyCredential sharedKeyCredential =
                new StorageSharedKeyCredential(accountName, accountKey);

            string dfsUri = $"https://{accountName}.dfs.core.windows.net";

            DataLakeServiceClient dataLakeServiceClient = new DataLakeServiceClient(
                new Uri(dfsUri),
                sharedKeyCredential);

            return dataLakeServiceClient;
        }
        // </Snippet_AuthorizeWithKey>

        // ---------------------------------------------------------
        // Connect to the storage account (Azure AD - get Data Lake service client)
        //----------------------------------------------------------

        // <Snippet_AuthorizeWithAAD>
        public static DataLakeServiceClient GetDataLakeServiceClient(string accountName)
        {
            string dfsUri = $"https://{accountName}.dfs.core.windows.net";

            DataLakeServiceClient dataLakeServiceClient = new DataLakeServiceClient(
                new Uri(dfsUri),
                new DefaultAzureCredential());

            return dataLakeServiceClient;
        }
        // </Snippet_AuthorizeWithAAD>

        // <Snippet_AuthorizeWithSAS>
        public static DataLakeServiceClient GetDataLakeServiceClientSAS(string accountName, string sasToken)
        {
            string dfsUri = $"https://{accountName}.dfs.core.windows.net";

            DataLakeServiceClient dataLakeServiceClient = new DataLakeServiceClient(
                new Uri(dfsUri),
                new AzureSasCredential(sasToken));

            return dataLakeServiceClient;
        }
        // </Snippet_AuthorizeWithSAS>
    }
}
