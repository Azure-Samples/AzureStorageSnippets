package com.blobs.devguide.blobs;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import com.azure.storage.blob.sas.*;

import java.time.OffsetDateTime;

public class BlobSAS {
    // <Snippet_RequestUserDelegationKey>
    public UserDelegationKey requestUserDelegationKey(BlobServiceClient blobServiceClient) {
        // Request a user delegation key that's valid for 1 day
        UserDelegationKey userDelegationKey = blobServiceClient.getUserDelegationKey(
            OffsetDateTime.now(),
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
                .setStartTime(OffsetDateTime.now());

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
                .setStartTime(OffsetDateTime.now());

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
        }
        // </Snippet_UseUserDelegationSASContainer>
    }
    
}
