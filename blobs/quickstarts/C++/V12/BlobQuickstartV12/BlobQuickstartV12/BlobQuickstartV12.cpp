// BlobQuickstartV12.cpp

//<Snippet_Includes>
#include <stdlib.h>
#include <iostream>
#include <azure/storage/blobs.hpp>
//</Snippet_Includes>


int main()
{

    std::cout << "Azure Blob storage v12 - C++ quickstart sample" << std::endl;

    try
    {
        //<Snippet_ConnectionString>
        // Retrieve the connection string for use with the application. The storage
        // connection string is stored in an environment variable on the machine
        // running the application called AZURE_STORAGE_CONNECTION_STRING.
        // Note that _MSC_VER is set when using MSVC compiler.
        static const char* AZURE_STORAGE_CONNECTION_STRING = "AZURE_STORAGE_CONNECTION_STRING";
#if !defined(_MSC_VER)
        const char* connectionString = std::getenv(AZURE_STORAGE_CONNECTION_STRING);
#else
        // Use getenv_s for MSVC
        size_t requiredSize;
        getenv_s(&requiredSize, NULL, NULL, AZURE_STORAGE_CONNECTION_STRING);
        if (requiredSize == 0) {
            throw std::runtime_error("missing connection string from env.");
        }
        std::vector<char> value(requiredSize);
        getenv_s(&requiredSize, value.data(), value.size(), AZURE_STORAGE_CONNECTION_STRING);
        std::string connectionStringStr = std::string(value.begin(), value.end());
        const char* connectionString = connectionStringStr.c_str();
#endif
        //</Snippet_ConnectionString>

        //<Snippet_CreateContainer>
        using namespace Azure::Storage::Blobs;

        std::string containerName = "myblobcontainer";

        // Initialize a new instance of BlobContainerClient
        BlobContainerClient containerClient
            = BlobContainerClient::CreateFromConnectionString(connectionString, containerName);
        
        // Create the container. This will do nothing if the container already exists.
        std::cout << "Creating container: " << containerName << std::endl;
        containerClient.CreateIfNotExists();
        //</Snippet_CreateContainer>

        //<Snippet_UploadBlob>
        std::string blobName = "blob.txt";
        uint8_t blobContent[] = "Hello Azure!";
        // Create the block blob client
        BlockBlobClient blobClient = containerClient.GetBlockBlobClient(blobName);
        
        // Upload the blob
        std::cout << "Uploading blob: " << blobName << std::endl;
        blobClient.UploadFrom(blobContent, sizeof(blobContent));
        //</Snippet_UploadBlob>

        //<Snippet_ListBlobs>
        std::cout << "Listing blobs..." << std::endl;
        auto listBlobsResponse = containerClient.ListBlobs();
        for (auto blobItem : listBlobsResponse.Blobs)
        {
            std::cout << "Blob name: " << blobItem.Name << std::endl;
        }
        //</Snippet_ListBlobs>

        //<Snippet_DownloadBlob>
        auto properties = blobClient.GetProperties().Value;
        std::vector<uint8_t> downloadedBlob(properties.BlobSize);

        blobClient.DownloadTo(downloadedBlob.data(), downloadedBlob.size());
        std::cout << "Downloaded blob contents: " << std::string(downloadedBlob.begin(), downloadedBlob.end()) << std::endl;
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

