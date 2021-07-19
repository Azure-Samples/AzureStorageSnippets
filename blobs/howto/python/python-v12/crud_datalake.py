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



import os, uuid, sys
from azure.storage.filedatalake import DataLakeServiceClient
from azure.core._match_conditions import MatchConditions
from azure.storage.filedatalake._models import ContentSettings
from azure.identity import ClientSecretCredential


# ------------------------------------------------
# Application driver
# ------------------------------------------------

tenant_id=""
client_id=""
client_secret=""
storage_account_name=""
storage_account_key=""

local_path=""
local_file_name=""
service_client=""
file_system_client=""
file_system_name=""
directory_path=""

def menu(self):
    
    os.system("cls")
    initialize_storage_account(storage_account_name, storage_account_key)

    print("Choose a Data Lake CRUD scenario:")

    print("1) Create a container")
    print("2) Create a Directory")
    print("3) Rename Directory")
    print("4) Delete Directory")
    print("5) Upload to Directory")
    print("6) Download from directory")
    print("7) List directory contents")
    print("X) Exit to main menu")
    option = input("\r\nSelect an option: ")

    if option == "1":
        create_file_system()
        input("Press Enter to continue ")
        return True
    elif option == "2":
        create_directory()
        input("Press Enter to continue ")
        return True
    elif option == "3":
        rename_directory()
        input("Press Enter to continue ")
        return True
    elif option == "4":
        delete_directory()
        input("Press Enter to continue ")
        return True
    elif option == "5":
        upload_file_to_directory()
        input("Press Enter to continue ")
        return True
    elif option == "6":
        download_file_from_directory()
        input("Press Enter to continue ")
        return True
    elif option == "7":
        list_directory_contents()
        input("Press Enter to continue ")
        return True
    elif option == "x" or option == "X":
        return False
    else:
        print("Unknown option: " + str(option))
        input("Press Enter to continue ")
        return True

# -------------------------------------------------
# Connect to account
# -------------------------------------------------

# <Snippet_AuthorizeWithKey>
def initialize_storage_account(storage_account_name, storage_account_key):
    
    try:  
        global service_client

        service_client = DataLakeServiceClient(account_url="{}://{}.dfs.core.windows.net".format(
            "https", storage_account_name), credential=storage_account_key)
    
    except Exception as e:
        print(e)
# </Snippet_AuthorizeWithKey>

# -------------------------------------------------
# Connect to account - Azure AD
# -------------------------------------------------

# <Snippet_AuthorizeWithAAD>
def initialize_storage_account_ad(storage_account_name, client_id, client_secret, tenant_id):
    
    try:  
        global service_client

        credential = ClientSecretCredential(tenant_id, client_id, client_secret)

        service_client = DataLakeServiceClient(account_url="{}://{}.dfs.core.windows.net".format(
            "https", storage_account_name), credential=credential)
    
    except Exception as e:
        print(e)
# </Snippet_AuthorizeWithAAD>

# -------------------------------------------------
# Create a file system
# -------------------------------------------------

# <Snippet_CreateContainer>
def create_file_system():
    try:
        global file_system_client

        file_system_client = service_client.create_file_system(file_system="my-file-system")
    
    except Exception as e:
        print(e) 
# </Snippet_CreateContainer>

# -------------------------------------------------
# Create directory method
# -------------------------------------------------

# <Snippet_CreateDirectory>
def create_directory():
    try:
        file_system_client.create_directory("my-directory")
    
    except Exception as e:
     print(e) 
# </Snippet_CreateDirectory>

# -------------------------------------------------
# Rename directory method
# ------------------------------------------------
 
# <Snippet_RenameDirectory>
def rename_directory():
    try:
       
       file_system_client = service_client.get_file_system_client(file_system="my-file-system")
       directory_client = file_system_client.get_directory_client("my-directory")
       
       new_dir_name = "my-directory-renamed"
       directory_client.rename_directory(new_name=directory_client.file_system_name + '/' + new_dir_name)

    except Exception as e:
     print(e) 
# </Snippet_RenameDirectory>

# -------------------------------------------------
# Delete directory method
# -------------------------------------------------

# <Snippet_DeleteDirectory>
def delete_directory():
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-file-system")
        directory_client = file_system_client.get_directory_client("my-directory")

        directory_client.delete_directory()
    except Exception as e:
     print(e) 
# </Snippet_DeleteDirectory>

# ------------------------------------------------
# Upload a file to a directory
# ------------------------------------------------

# <Snippet_UploadFile>
def upload_file_to_directory():
    try:

        file_system_client = service_client.get_file_system_client(file_system="my-file-system")

        directory_client = file_system_client.get_directory_client("my-directory")
        
        file_client = directory_client.create_file("uploaded-file.txt")
        local_file = open("C:\\file-to-upload.txt",'r')

        file_contents = local_file.read()

        file_client.append_data(data=file_contents, offset=0, length=len(file_contents))

        file_client.flush_data(len(file_contents))

    except Exception as e:
      print(e) 
# </Snippet_UploadFile>

# ------------------------------------------------
# Upload a file to a directory in bulk
# ------------------------------------------------

# <Snippet_UploadFileBulk>
def upload_file_to_directory_bulk():
    try:

        file_system_client = service_client.get_file_system_client(file_system="my-file-system")

        directory_client = file_system_client.get_directory_client("my-directory")
        
        file_client = directory_client.get_file_client("uploaded-file.txt")

        local_file = open("C:\\file-to-upload.txt",'r')

        file_contents = local_file.read()

        file_client.upload_data(file_contents, overwrite=True)

    except Exception as e:
      print(e) 
# </Snippet_UploadFileBulk>

# ------------------------------------------------
# Download a file from a directory
# ------------------------------------------------

# <Snippet_DownloadFromDirectory>
def download_file_from_directory():
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-file-system")

        directory_client = file_system_client.get_directory_client("my-directory")
        
        local_file = open("C:\\file-to-download.txt",'wb')

        file_client = directory_client.get_file_client("uploaded-file.txt")

        download = file_client.download_file()

        downloaded_bytes = download.readall()

        local_file.write(downloaded_bytes)

        local_file.close()

    except Exception as e:
     print(e) 
# </Snippet_DownloadFromDirectory>

# ------------------------------------------------
# List contents of a directory
# ------------------------------------------------

# <Snippet_ListFilesInDirectory>
def list_directory_contents():
    try:
        
        file_system_client = service_client.get_file_system_client(file_system="my-file-system")

        paths = file_system_client.get_paths(path="my-directory")

        for path in paths:
            print(path.name + '\n')

    except Exception as e:
     print(e)
# </Snippet_ListFilesInDirectory> 
