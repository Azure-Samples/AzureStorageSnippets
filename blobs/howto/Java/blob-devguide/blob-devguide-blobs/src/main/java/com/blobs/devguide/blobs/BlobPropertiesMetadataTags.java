package com.blobs.devguide.blobs;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;

import java.util.*;

public class BlobPropertiesMetadataTags {
    // <Snippet_SetBlobProperties>
    public void setBlobProperties(BlobClient blobClient) {
        BlobProperties properties = blobClient.getProperties();

        // Set the ContentLanguage and ContentType headers, and populate the remaining
        // headers from the existing properties
        BlobHttpHeaders blobHeaders = new BlobHttpHeaders()
                .setContentLanguage("en-us")
                .setContentType("text/plain")
                .setCacheControl(properties.getCacheControl())
                .setContentDisposition(properties.getContentDisposition())
                .setContentEncoding(properties.getContentEncoding())
                .setContentMd5(properties.getContentMd5());

        blobClient.setHttpHeaders(blobHeaders);
        System.out.println("Set HTTP headers completed");
    }
    // </Snippet_SetBlobProperties>

    // <Snippet_GetBlobProperties>
    public void getBlobProperties(BlobClient blobClient) {
        BlobProperties properties = blobClient.getProperties();

        System.out.printf("BlobType: %s%n", properties.getBlobType());
        System.out.printf("BlobSize: %d%n", properties.getBlobSize());
        System.out.printf("ContentLanguage: %s%n", properties.getContentLanguage());
        System.out.printf("ContentType: %s%n", properties.getContentType());
    }
    // </Snippet_GetBlobProperties>

    // <Snippet_AddBlobMetadata>
    public void addBlobMetadata(BlobClient blobClient) {
        Map<String, String> metadata = new HashMap<String, String>();
        metadata.put("docType", "text");
        metadata.put("category", "reference");

        try {
            blobClient.setMetadata(metadata);
            System.out.printf("Set metadata completed %n");
        } catch (UnsupportedOperationException error) {
            System.out.printf("Failure while setting metadata %n");
        }
    }
    // </Snippet_AddBlobMetadata>

    // <Snippet_ReadBlobMetadata>
    public void readBlobMetadata(BlobClient blobClient) {
        // Get blob properties and metadata
        BlobProperties properties = blobClient.getProperties();

        System.out.printf("Blob metadata: %n");
        properties.getMetadata().entrySet().forEach(metadataItem -> {
            System.out.printf(" %s = %s%n", metadataItem.getKey(), metadataItem.getValue());
        });
    }
    // </Snippet_ReadBlobMetadata>

    // <Snippet_SetBLobTags>
    public void setBlobTags(BlobClient blobClient) {
        // Get any existing tags for the blob if they need to be preserved
        Map<String, String> tags = blobClient.getTags();

        // Add or modify tags
        tags.put("Sealed", "false");
        tags.put("Content", "image");
        tags.put("Date", "2022-01-01");

        // setTags will replace existing tags with the map entries we pass in
        blobClient.setTags(tags);
    }
    // </Snippet_SetBLobTags>

    // <Snippet_ClearBLobTags>
    public void clearBlobTags(BlobClient blobClient) {
        Map<String, String> tags = new HashMap<String, String>();
        blobClient.setTags(tags);
    }
    // </Snippet_ClearBLobTags>

    // <Snippet_GetBLobTags>
    public void getBlobTags(BlobClient blobClient) {
        Map<String, String> tags = blobClient.getTags();

        System.out.println("Blob tags:");
        for (Map.Entry<String, String> entry : tags.entrySet())
            System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue());
    }
    // </Snippet_GetBLobTags>

    // <Snippet_FindBlobsByTag>
    public void findBlobsByTag(BlobContainerClient blobContainerClient) {
        String query = "\"Content\"='image'";

        blobContainerClient.findBlobsByTags(query)
                .forEach(blob -> System.out.printf("Name: %s%n", blob.getName()));
    }
    // </Snippet_FindBlobsByTag>
}
