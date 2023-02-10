package com.datalake.manage;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.azure.storage.common.StorageSharedKeyCredential;
import com.azure.storage.file.datalake.DataLakeServiceClient;
import com.azure.storage.file.datalake.DataLakeServiceClientBuilder;

public class Authorize_DataLake {
    
    // ---------------------------------------------------------
    // Connect to the storage account - use account key
    // ----------------------------------------------------------
    
    //<Snippet_AuthorizeWithKey>
    static public DataLakeServiceClient GetDataLakeServiceClient
    (String accountName, String accountKey){

        StorageSharedKeyCredential sharedKeyCredential =
            new StorageSharedKeyCredential(accountName, accountKey);

        DataLakeServiceClientBuilder builder = new DataLakeServiceClientBuilder();

        builder.credential(sharedKeyCredential);
        builder.endpoint("https://" + accountName + ".dfs.core.windows.net");

        return builder.buildClient();
    }  
    //</Snippet_AuthorizeWithKey>
    
    // ---------------------------------------------------------
    // Connect to the storage account - use service principal and Azure AD
    // ----------------------------------------------------------
    
    //<Snippet_AuthorizeWithAzureAD>
    static public DataLakeServiceClient GetDataLakeServiceClient
        (String accountName, String clientId, String ClientSecret, String tenantID){

        String endpoint = "https://" + accountName + ".dfs.core.windows.net";
        
        DefaultAzureCredential defaultCredential = new DefaultAzureCredentialBuilder().build();

        DataLakeServiceClientBuilder builder = new DataLakeServiceClientBuilder();
        return builder.credential(defaultCredential).endpoint(endpoint).buildClient();
    } 
    //</Snippet_AuthorizeWithAzureAD> 
    
}
