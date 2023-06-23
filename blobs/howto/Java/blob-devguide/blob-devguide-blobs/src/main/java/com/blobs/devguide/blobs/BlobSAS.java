package com.blobs.devguide.blobs;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.sas.*;
import com.azure.storage.common.sas.AccountSasPermission;
import com.azure.storage.common.sas.AccountSasResourceType;
import com.azure.storage.common.sas.AccountSasService;
import com.azure.storage.common.sas.AccountSasSignatureValues;

import java.time.OffsetDateTime;

public class BlobSAS {
    // <Snippet_RequestUserDelegationKey>
    public UserDelegationKey requestUserDelegationKey(BlobServiceClient blobServiceClient) {
        // Request a user delegation key that's valid for 1 day, as an example
        UserDelegationKey userDelegationKey = blobServiceClient.getUserDelegationKey(
            OffsetDateTime.now().minusMinutes(5),
            OffsetDateTime.now().plusDays(1));

        return userDelegationKey;
    }
    // </Snippet_RequestUserDelegationKey>

    // <Snippet_CreateUserDelegationSASBlob>
    public String createUserDelegationSASBlob(BlobClient blobClient, UserDelegationKey userDelegationKey) {
        // Create a SAS token that's valid for 1 day, as an example
        OffsetDateTime expiryTime = OffsetDateTime.now().plusDays(1);

        // Assign read permissions to the SAS token
        BlobSasPermission sasPermission = new BlobSasPermission()
                .setReadPermission(true);

        BlobServiceSasSignatureValues sasSignatureValues = new BlobServiceSasSignatureValues(expiryTime, sasPermission)
                .setStartTime(OffsetDateTime.now().minusMinutes(5));

        String sasToken = blobClient.generateUserDelegationSas(sasSignatureValues, userDelegationKey);
        return sasToken;
    }
    // </Snippet_CreateUserDelegationSASBlob>

    // <Snippet_CreateUserDelegationSASContainer>
    public String createUserDelegationSASContainer(BlobContainerClient containerClient, UserDelegationKey userDelegationKey) {
        // Create a SAS token that's valid for 1 day, as an example
        OffsetDateTime expiryTime = OffsetDateTime.now().plusDays(1);

        // Assign read permissions to the SAS token
        BlobContainerSasPermission sasPermission = new BlobContainerSasPermission()
                .setReadPermission(true);

        BlobServiceSasSignatureValues sasSignatureValues = new BlobServiceSasSignatureValues(expiryTime, sasPermission)
                .setStartTime(OffsetDateTime.now().minusMinutes(5));

        String sasToken = containerClient.generateUserDelegationSas(sasSignatureValues, userDelegationKey);
        return sasToken;
    }
    // </Snippet_CreateUserDelegationSASContainer>

    public void useUserDelegationSASBlob(BlobServiceClient blobServiceClient) {
        // Get a user delegation key
        UserDelegationKey userDelegationKey = requestUserDelegationKey(blobServiceClient);

        // <Snippet_UseUserDelegationSASBlob>
        // Create a SAS token for a blob
        BlobClient blobClient = blobServiceClient
                .getBlobContainerClient("sample-container")
                .getBlobClient("sample-blob.txt");
        String sasToken = createUserDelegationSASBlob(blobClient, userDelegationKey);

        // Create a new BlobClient using the SAS token
        BlobClient sasBlobClient = new BlobClientBuilder()
                .endpoint(blobClient.getBlobUrl())
                .sasToken(sasToken)
                .buildClient();
        // </Snippet_UseUserDelegationSASBlob>
    }
    

    public void useUserDelegationSASContainer(BlobServiceClient blobServiceClient) {
        // Get a user delegation key
        UserDelegationKey userDelegationKey = requestUserDelegationKey(blobServiceClient);

        // <Snippet_UseUserDelegationSASContainer>
        // Create a SAS token for a container
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient("sample-container");
        String sasToken = createUserDelegationSASContainer(containerClient, userDelegationKey);

        // Create a new BlobContainerClient using the SAS token
        BlobContainerClient sasContainerClient = new BlobContainerClientBuilder()
                .endpoint(containerClient.getBlobContainerUrl())
                .sasToken(sasToken)
                .buildClient();
        // </Snippet_UseUserDelegationSASContainer>

        // list blobs in container
        for (BlobItem blobItem : sasContainerClient.listBlobs()) {
            System.out.println("This is the blob name: " + blobItem.getName());
        }
    }
    
    // <Snippet_CreateAccountSAS>
    public String createAccountSAS(BlobServiceClient blobServiceClient) {
        // Configure the SAS parameters
        OffsetDateTime expiryTime = OffsetDateTime.now().plusDays(1);
        AccountSasPermission accountSasPermission = new AccountSasPermission()
                .setReadPermission(true);
        AccountSasService services = new AccountSasService()
                .setBlobAccess(true);
        AccountSasResourceType resourceTypes = new AccountSasResourceType()
                .setService(true);

        // Generate the account SAS
        AccountSasSignatureValues accountSasValues = new AccountSasSignatureValues(
            expiryTime,
            accountSasPermission,
            services,
            resourceTypes);
        String sasToken = blobServiceClient.generateAccountSas(accountSasValues);

        return sasToken;
    }
    // </Snippet_CreateAccountSAS>

    public void useAccountSAS(BlobServiceClient blobServiceClient) {
        // <Snippet_UseAccountSAS>
        // Create a SAS token
        String sasToken = createAccountSAS(blobServiceClient);

        // Create a new BlobServiceClient using the SAS token
        BlobServiceClient sasServiceClient = new BlobServiceClientBuilder()
                .endpoint(blobServiceClient.getAccountUrl())
                .sasToken(sasToken)
                .buildClient();
        // </Snippet_UseAccountSAS>
    }

    // <Snippet_CreateServiceSASContainer>
    public String createServiceSASContainer(BlobContainerClient containerClient) {
        // Create a SAS token that's valid for 1 day, as an example
        OffsetDateTime expiryTime = OffsetDateTime.now().plusDays(1);

        // Assign read permissions to the SAS token
        BlobContainerSasPermission sasPermission = new BlobContainerSasPermission()
                .setReadPermission(true);

        BlobServiceSasSignatureValues sasSignatureValues = new BlobServiceSasSignatureValues(expiryTime, sasPermission)
                .setStartTime(OffsetDateTime.now().minusMinutes(5));

        String sasToken = containerClient.generateSas(sasSignatureValues);
        return sasToken;
    }
    // </Snippet_CreateServiceSASContainer>

    // <Snippet_CreateServiceSASBlob>
    public String createServiceSASBlob(BlobClient blobClient) {
        // Create a SAS token that's valid for 1 day, as an example
        OffsetDateTime expiryTime = OffsetDateTime.now().plusDays(1);

        // Assign read permissions to the SAS token
        BlobSasPermission sasPermission = new BlobSasPermission()
                .setReadPermission(true);

        BlobServiceSasSignatureValues sasSignatureValues = new BlobServiceSasSignatureValues(expiryTime, sasPermission)
                .setStartTime(OffsetDateTime.now().minusMinutes(5));

        String sasToken = blobClient.generateSas(sasSignatureValues);
        return sasToken;
    }  
    // </Snippet_CreateServiceSASBlob>

    public void useServiceSASContainer(BlobServiceClient blobServiceClient) {
        // <Snippet_UseServiceSASContainer>
        // Create a SAS token
        BlobContainerClient containerClient = blobServiceClient
                .getBlobContainerClient("sample-container");
        String sasToken = createServiceSASContainer(containerClient);

        // Create a new BlobContainerClient using the SAS token
        BlobContainerClient sasContainerClient = new BlobContainerClientBuilder()
                .endpoint(containerClient.getBlobContainerUrl())
                .sasToken(sasToken)
                .buildClient();
        // </Snippet_UseServiceSASContainer>
    }

    public void useServiceSASBlob(BlobServiceClient blobServiceClient) {
        // <Snippet_UseServiceSASBlob>
        // Create a SAS token
        BlobClient blobClient = blobServiceClient
                .getBlobContainerClient("sample-container")
                .getBlobClient("sample-blob.txt");
        String sasToken = createServiceSASBlob(blobClient);

        // Create a new BlobClient using the SAS token
        BlobClient sasBlobClient = new BlobClientBuilder()
                .endpoint(blobClient.getBlobUrl())
                .sasToken(sasToken)
                .buildClient();
        // </Snippet_UseServiceSASBlob>
    }
}
