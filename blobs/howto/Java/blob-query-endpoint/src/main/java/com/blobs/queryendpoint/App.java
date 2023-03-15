package com.blobs.queryendpoint;

import com.azure.identity.*;
import com.azure.storage.blob.*;

public class App 
{
    public static void main( String[] args )
    {
        // <Snippet_CreateClientWithEndpoint>
        String saName = "<storage-account-name>";
        DefaultAzureCredential credential = new DefaultAzureCredentialBuilder().build();

        AccountProperties accountProps = new AccountProperties();

        String blobEndpoint = accountProps.GetBlobServiceEndpoint(saName, credential);
        System.out.printf("URI: %s", blobEndpoint);

        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint(blobEndpoint)
                .credential(credential)
                .buildClient();

        // Do something with the storage account or its resources ...
        // </Snippet_CreateClientWithEndpoint>
    }
}
