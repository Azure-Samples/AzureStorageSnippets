// BlobQuickstartV12.cpp

//<Snippet_Includes>
#include <iostream>
#include <stdlib.h>
#include <vector>

#include <azure/storage/files/shares.hpp>
//</Snippet_Includes>


int main()
{

    std::cout << "Azure Files Shares storage v12 - C++ quickstart sample" << std::endl;

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

        //<Snippet_CreateFilesShare>
        using namespace Azure::Storage::Files::Shares;

        std::string shareName = "sample-share";

        // Initialize a new instance of ShareClient
        auto shareClient = ShareClient::CreateFromConnectionString(connectionString, shareName);

        // Create the files share. This will do nothing if the files share already exists.
        std::cout << "Creating files share: " << shareName << std::endl;
        shareClient.CreateIfNotExists();
        //</Snippet_CreateFilesShare>

        //<Snippet_UploadFile>
        std::string fileName = "sample-file";
        uint8_t fileContent[] = "Hello Azure!";

        // Create the ShareFileClient
        ShareFileClient fileClient = shareClient.GetRootDirectoryClient().GetFileClient(fileName);

        // Upload the file
        std::cout << "Uploading file: " << fileName << std::endl;
        fileClient.UploadFrom(fileContent, sizeof(fileContent));
        //</Snippet_UploadFile>


        //<Snippet_SetFileMetadata>
        Azure::Storage::Metadata fileMetadata = { {"key1", "value1"}, {"key2", "value2"} };
        fileClient.SetMetadata(fileMetadata);
        //</Snippet_SetFileMetadata>

        //<Snippet_GetFileMetadata>
        // Retrieve the file properties
        auto properties = fileClient.GetProperties().Value;
        std::cout << "Listing blob metadata..." << std::endl;
        for (auto metadata : properties.Metadata)
        {
            std::cout << metadata.first << ":" << metadata.second << std::endl;
        }
        //</Snippet_GetFileMetadata>

        //<Snippet_DownloadFile>
        std::vector<uint8_t> fileDownloaded(properties.FileSize);
        fileClient.DownloadTo(fileDownloaded.data(), fileDownloaded.size());

        std::cout << "Downloaded file contents: " << std::string(fileDownloaded.begin(), fileDownloaded.end()) << std::endl;
        //</Snippet_DownloadFile>


        //<Snippet_DeleteFile>
        std::cout << "Deleting file: " << fileName << std::endl;
        fileClient.DeleteIfExists();
        //</Snippet_DeleteFile>

        //<Snippet_DeleteFilesShare>
        std::cout << "Deleting files share: " << shareName << std::endl;
        shareClient.DeleteIfExists();
        //</Snippet_DeleteFilesShare>
    }
    catch (std::runtime_error& e)
    {
        std::cout << "Error: " << e.what() << std::endl;
    }
}

