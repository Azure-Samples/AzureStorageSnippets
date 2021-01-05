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

        public static void GetDataLakeServiceClient(ref DataLakeServiceClient dataLakeServiceClient,
            string accountName, string accountKey)
        {
            StorageSharedKeyCredential sharedKeyCredential =
                new StorageSharedKeyCredential(accountName, accountKey);

            string dfsUri = "https://" + accountName + ".dfs.core.windows.net";

            dataLakeServiceClient = new DataLakeServiceClient
                (new Uri(dfsUri), sharedKeyCredential);
        }

        // ---------------------------------------------------------
        // Connect to the storage account (Azure AD - get Data Lake service client)
        //----------------------------------------------------------

        public static void GetDataLakeServiceClient(ref DataLakeServiceClient dataLakeServiceClient,
            String accountName, String clientID, string clientSecret, string tenantID)
        {

            TokenCredential credential = new ClientSecretCredential(
                tenantID, clientID, clientSecret, new TokenCredentialOptions());

            string dfsUri = "https://" + accountName + ".dfs.core.windows.net";

            dataLakeServiceClient = new DataLakeServiceClient(new Uri(dfsUri), credential);
        }
    }
}
