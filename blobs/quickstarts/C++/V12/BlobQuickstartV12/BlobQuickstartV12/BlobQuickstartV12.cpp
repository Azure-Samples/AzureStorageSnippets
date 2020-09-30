// BlobQuickstartV12.cpp

//<Snippet_Includes>
// Prevent warnings from using std library
#ifdef _MSC_VER
#define _CRT_SECURE_NO_WARNINGS
#endif

#include <iostream>
#include <stdlib.h>
#include "azure\storage\blobs\blob.hpp"
//</Snippet_Includes>

int main()
{
    std::cout << "Azure Blob storage v12 - C++ quickstart sample" << std::endl;

    //<Snippet_ConnectionString>
    // Retrieve the connection string for use with the application. The storage
    // connection string is stored in an environment variable on the machine
    // running the application called AZURE_STORAGE_CONNECTION_STRING.
    const char* connectionString = std::getenv("AZURE_STORAGE_CONNECTION_STRING");
    //</Snippet_ConnectionString>

    try
    {
        //<Snippet_CreateContainer>
        using namespace Azure::Storage::Blobs;

        std::string containerName = "myblobcontainer";

        // Initialize a new instance of BlobContainerClient
        BlobContainerClient containerClient =
            BlobContainerClient::CreateFromConnectionString(connectionString, containerName);

        try
        {
            // Create the container. This will throw an exception if the container already exists.
            std::cout << "Creating container: " << containerName << std::endl;
            containerClient.Create();
        }
        catch (std::runtime_error& e)
        {
            // The container already exists
            std::cout << "Error: " << e.what() << std::endl;
        }
        //</Snippet_CreateContainer>

        //<Snippet_UploadBlob>
        std::string blobName = "blob.txt";
        std::string blobContent = "Hello Azure!";

        // Create the block blob client
        BlockBlobClient blobClient = containerClient.GetBlockBlobClient(blobName);

        // Upload the blob
        std::cout << "Uploading blob: " << blobName << std::endl;
        blobClient.UploadFrom(reinterpret_cast<const uint8_t*>(blobContent.data()), blobContent.size());
        //</Snippet_UploadBlob>

        //<Snippet_ListBlobs>
        std::cout << "Listing blobs..." << std::endl;

        auto response = containerClient.ListBlobsFlatSegment();

        ListBlobsFlatSegmentResult result = response.ExtractValue();

        for (BlobItem blobItem : result.Items)
        {
            std::cout << "Blob name: " << blobItem.Name.data() << std::endl;
        }
        //</Snippet_ListBlobs>

        //<Snippet_DownloadBlob>
        auto properties = *blobClient.GetProperties();
        std::string downloadedBlob = "";
        downloadedBlob.resize(static_cast<std::size_t>(properties.ContentLength));
        blobClient.DownloadTo(reinterpret_cast<uint8_t*>(&downloadedBlob[0]), blobContent.size());
        std::cout << "Downloaded blob contents: " << downloadedBlob << std::endl;
        //</Snippet_DownloadBlob>

        //<Snippet_DeleteBlob>
        std::cout << "Deleting blob: " << blobName << std::endl;
        blobClient.Delete();
        //</Snippet_DeleteBlob>

        //<Snippet_DeleteContainer>
        std::cout << "Deleting container: " << containerName << std::endl;
        containerClient.Delete();
        //</Snippet_DeleteContainer>

    }
    catch (std::runtime_error& e)
    {
        std::cout << "Error: " << e.what() << std::endl;
    }
    
}
