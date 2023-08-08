package com.datalake.manage;

import com.azure.identity.*;
import com.azure.storage.common.StorageSharedKeyCredential;
import com.azure.storage.file.datalake.*;

public class Authorize_DataLake {
    
    // ---------------------------------------------------------
    // Connect to the storage account - use account key
    // ----------------------------------------------------------
    
    //<Snippet_AuthorizeWithKey>
    static public DataLakeServiceClient GetDataLakeServiceClient
    (String accountName, String accountKey){
        StorageSharedKeyCredential sharedKeyCredential =
            new StorageSharedKeyCredential(accountName, accountKey);

        DataLakeServiceClient dataLakeServiceClient = new DataLakeServiceClientBuilder()
            .endpoint("https://" + accountName + ".dfs.core.windows.net")
            .credential(sharedKeyCredential)
            .buildClient();

        return dataLakeServiceClient;
    }  
    //</Snippet_AuthorizeWithKey>

    // ---------------------------------------------------------
    // Connect to the storage account - use SAS
    // ----------------------------------------------------------
    
    //<Snippet_AuthorizeWithSAS>
    static public DataLakeServiceClient GetDataLakeServiceClientSAS(String accountName, String sasToken){
        DataLakeServiceClient dataLakeServiceClient = new DataLakeServiceClientBuilder()
            .endpoint("https://" + accountName + ".dfs.core.windows.net")
            .sasToken(sasToken)
            .buildClient();

        return dataLakeServiceClient;
    }  
    //</Snippet_AuthorizeWithSAS>
    
    // ---------------------------------------------------------
    // Connect to the storage account - use service principal and Azure AD
    // ----------------------------------------------------------
    
    //<Snippet_AuthorizeWithAzureAD>
    static public DataLakeServiceClient GetDataLakeServiceClient(String accountName){
        DefaultAzureCredential defaultCredential = new DefaultAzureCredentialBuilder().build();

        DataLakeServiceClient dataLakeServiceClient = new DataLakeServiceClientBuilder()
            .endpoint("https://" + accountName + ".dfs.core.windows.net")
            .credential(defaultCredential)
            .buildClient();

        return dataLakeServiceClient;
    } 
    //</Snippet_AuthorizeWithAzureAD> 
    
}
