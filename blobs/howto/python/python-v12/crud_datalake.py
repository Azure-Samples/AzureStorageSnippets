# ----------------------------------------------------------------------------------
# MIT License
#
# Copyright(c) Microsoft Corporation. All rights reserved.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# ----------------------------------------------------------------------------------
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.



import os
from azure.storage.filedatalake import (
    DataLakeServiceClient,
    DataLakeDirectoryClient,
    FileSystemClient
)
from azure.identity import DefaultAzureCredential

# -------------------------------------------------
# Connect to account
# -------------------------------------------------

class ManageDataLake:
    
    # <Snippet_AuthorizeWithKey>
    def get_service_client_account_key(self, account_name, account_key) -> DataLakeServiceClient:
        account_url = f"https://{account_name}.dfs.core.windows.net"
        service_client = DataLakeServiceClient(account_url, credential=account_key)

        return service_client
    # </Snippet_AuthorizeWithKey>

    # -------------------------------------------------
    # Connect to account - Azure AD
    # -------------------------------------------------

    # <Snippet_AuthorizeWithAAD>
    def get_service_client_token_credential(self, account_name) -> DataLakeServiceClient:
        account_url = f"https://{account_name}.dfs.core.windows.net"
        token_credential = DefaultAzureCredential()

        service_client = DataLakeServiceClient(account_url, credential=token_credential)

        return service_client
    # </Snippet_AuthorizeWithAAD>

    # -------------------------------------------------
    # Connect to account - Azure AD
    # -------------------------------------------------

    # <Snippet_AuthorizeWithSAS>
    def get_service_client_sas(self, account_name: str, sas_token: str) -> DataLakeServiceClient:
        account_url = f"https://{account_name}.dfs.core.windows.net"

        # The SAS token string can be passed in as credential param or appended to the account URL
        service_client = DataLakeServiceClient(account_url, credential=sas_token)

        return service_client
    # </Snippet_AuthorizeWithSAS>

    # -------------------------------------------------
    # Create a file system
    # -------------------------------------------------

    # <Snippet_CreateContainer>
    def create_file_system(self, service_client: DataLakeServiceClient, file_system_name: str) -> FileSystemClient:
        file_system_client = service_client.create_file_system(file_system=file_system_name)

        return file_system_client
    # </Snippet_CreateContainer>

    # -------------------------------------------------
    # Create directory method
    # -------------------------------------------------

    # <Snippet_CreateDirectory>
    def create_directory(self, file_system_client: FileSystemClient, directory_name: str) -> DataLakeDirectoryClient:
        directory_client = file_system_client.create_directory(directory_name)

        return directory_client
    # </Snippet_CreateDirectory>

    # -------------------------------------------------
    # Rename directory method
    # ------------------------------------------------
    
    # <Snippet_RenameDirectory>
    def rename_directory(self, directory_client: DataLakeDirectoryClient, new_dir_name: str):
        directory_client.rename_directory(
            new_name=f"{directory_client.file_system_name}/{new_dir_name}")
    # </Snippet_RenameDirectory>

    # -------------------------------------------------
    # Delete directory method
    # -------------------------------------------------

    # <Snippet_DeleteDirectory>
    def delete_directory(self, directory_client: DataLakeDirectoryClient):
        directory_client.delete_directory()
    # </Snippet_DeleteDirectory>

    # ------------------------------------------------
    # Append data to a file
    # ------------------------------------------------

    # <Snippet_AppendData>
    def append_data_to_file(self, directory_client: DataLakeDirectoryClient, file_name: str):
        file_client = directory_client.get_file_client(file_name)
        file_size = file_client.get_file_properties().size
        
        data = b"Data to append to end of file"
        file_client.append_data(data, offset=file_size, length=len(data))

        file_client.flush_data(file_size + len(data))
    # </Snippet_AppendData>

    # ------------------------------------------------
    # Upload a file to a directory
    # ------------------------------------------------

    # <Snippet_UploadFile>
    def upload_file_to_directory(self, directory_client: DataLakeDirectoryClient, local_path: str, file_name: str):
        file_client = directory_client.get_file_client(file_name)

        with open(file=os.path.join(local_path, file_name), mode="rb") as data:
            file_client.upload_data(data, overwrite=True)
    # </Snippet_UploadFile>

    # ------------------------------------------------
    # Download a file from a directory
    # ------------------------------------------------

    # <Snippet_DownloadFromDirectory>
    def download_file_from_directory(self, directory_client: DataLakeDirectoryClient, local_path: str, file_name: str):
        file_client = directory_client.get_file_client(file_name)

        with open(file=os.path.join(local_path, file_name), mode="wb") as local_file:
            download = file_client.download_file()
            local_file.write(download.readall())
            local_file.close()
    # </Snippet_DownloadFromDirectory>

    # ------------------------------------------------
    # List contents of a directory
    # ------------------------------------------------

    # <Snippet_ListFilesInDirectory>
    def list_directory_contents(self, file_system_client: FileSystemClient, directory_name: str):
        paths = file_system_client.get_paths(path=directory_name)

        for path in paths:
            print(path.name + '\n')
    # </Snippet_ListFilesInDirectory>

# Main method.
if __name__ == '__main__':
    tenant_id = ""
    client_id = ""
    client_secret = ""
    storage_account_name = "<storage-account-name>"
    storage_account_key = ""

    local_path = r"<local-path>"
    local_file_name = "testfile.txt"
    file_system_name = "sample-filesystem"
    directory_path = "sample-directory"

    sample = ManageDataLake()

    service_client = sample.get_service_client_token_credential(storage_account_name)

    file_system_client = sample.create_file_system(service_client, file_system_name)

    directory_client = sample.create_directory(file_system_client, directory_path)

    sample.rename_directory(directory_client, "renamed-sample-directory")

    sample.upload_file_to_directory(directory_client, local_path, local_file_name)

    sample.append_data_to_file(directory_client, local_file_name)

    sample.download_file_from_directory(directory_client, local_path, local_file_name)

    sample.list_directory_contents(file_system_client, directory_path)

    sample.delete_directory(directory_client)