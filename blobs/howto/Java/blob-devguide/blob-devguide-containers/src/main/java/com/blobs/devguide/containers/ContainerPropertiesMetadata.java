package com.blobs.devguide.containers;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import java.util.*;

public class ContainerPropertiesMetadata {
    // <Snippet_GetContainerProperties>
    public void getContainerProperties(BlobContainerClient blobContainerClient) {
        BlobContainerProperties properties = blobContainerClient.getProperties();
        System.out.printf("Public Access Type: %s, Legal Hold? %b, Immutable? %b%n",
                properties.getBlobPublicAccess(),
                properties.hasLegalHold(),
                properties.hasImmutabilityPolicy());
    }
    // </Snippet_GetContainerProperties>

    // <Snippet_AddContainerMetadata>
    public void addContainerMetadata(BlobContainerClient blobContainerClient) {
        Map<String, String> metadata = new HashMap<String, String>();
        metadata.put("docType", "text");
        metadata.put("category", "reference");

        try {
            blobContainerClient.setMetadata(metadata);
            System.out.printf("Set metadata completed %n");
        } catch (UnsupportedOperationException error) {
            System.out.printf("Failure while setting metadata %n");
        }
    }
    // </Snippet_AddContainerMetadata>

    // <Snippet_ReadContainerMetadata>
    public void readContainerMetadata(BlobContainerClient blobContainerClient) {
        BlobContainerProperties properties = blobContainerClient.getProperties();

        System.out.printf("Container metadata: %n");
        properties.getMetadata().entrySet().forEach(metadataItem -> {
            System.out.printf(" %s = %s%n", metadataItem.getKey(), metadataItem.getValue());
        });
    }
    // </Snippet_ReadContainerMetadata>
}
