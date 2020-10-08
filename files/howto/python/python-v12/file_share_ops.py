#----------------------------------------------------------------------------------
# Microsoft Developer & Platform Evangelism
#
# Copyright (c) Microsoft Corporation. All rights reserved.
#
# THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
# EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
# OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#----------------------------------------------------------------------------------
# The example companies, organizations, products, domain names,
# e-mail addresses, logos, people, places, and events depicted
# herein are fictitious.  No association with any real company,
# organization, product, domain name, email address, logo, person,
# places, or events is intended or should be inferred.
#----------------------------------------------------------------------------------

import os # Provides system support to clear the screen

# <Snippet_Imports>
from azure.core.exceptions import (
    ResourceExistsError,
    ResourceNotFoundError
)

from azure.storage.fileshare import (
    ShareServiceClient,
    ShareClient,
    ShareDirectoryClient,
    ShareFileClient
)
# </Snippet_Imports>

from constants import Constants

class FileShareOperations:
    def __init__(self):
        super().__init__()
        self.constants = Constants()

    # <Snippet_CreateFileShare>
    def create_file_share(self, connection_string, share_name):
        try:
            # Create a ShareClient from a connection string
            share_client = ShareClient.from_connection_string(
                connection_string, share_name)

            print("Creating share:", share_name)
            share_client.create_share()

        except ResourceExistsError as ex:
            print("ResourceExistsError:", ex.message)
    # </Snippet_CreateFileShare>

    # <Snippet_CreateDirectory>
    def create_directory(self, connection_string, share_name, dir_name):
        try:
            # Create a ShareDirectoryClient from a connection string
            dir_client = ShareDirectoryClient.from_connection_string(
                connection_string, share_name, dir_name)

            print("Creating directory:", share_name + "/" + dir_name)
            dir_client.create_directory()

        except ResourceExistsError as ex:
            print("ResourceExistsError:", ex.message)
    # </Snippet_CreateDirectory>

    # <Snippet_UploadFile>
    def upload_local_file(self, connection_string, local_file_path, share_name, dest_file_path):
        try:
            source_file = open(local_file_path, "rb")
            data = source_file.read()

            # Create a ShareFileClient from a connection string
            file_client = ShareFileClient.from_connection_string(
                connection_string, share_name, dest_file_path)

            print("Uploading to:", share_name + "/" + dest_file_path)
            file_client.upload_file(data)

        except ResourceExistsError as ex:
            print("ResourceExistsError:", ex.message)

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_UploadFile>

    # <Snippet_ListFilesAndDirs>
    def list_files_and_dirs(self, connection_string, share_name, dir_name):
        try:
            # Create a ShareClient from a connection string
            share_client = ShareClient.from_connection_string(
                connection_string, share_name)

            for item in list(share_client.list_directories_and_files(dir_name)):
                if item["is_directory"]:
                    print("Directory:", item["name"])
                else:
                    print("File:", dir_name + "/" + item["name"])

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_ListFilesAndDirs>

    # <Snippet_DownloadFile>
    def download_azure_file(self, connection_string, share_name, dir_name, file_name):
        try:
            # Build the remote path
            source_file_path = dir_name + "/" + file_name

            # Add a prefix to the filename to 
            # distinguish it from the uploaded file
            dest_file_name = "DOWNLOADED-" + file_name

            # Create a ShareFileClient from a connection string
            file_client = ShareFileClient.from_connection_string(
                connection_string, share_name, source_file_path)

            print("Downloading to:", dest_file_name)

            # Open a file for writing bytes on the local system
            with open(dest_file_name, "wb") as data:
                # Download the file from Azure into a stream
                stream = file_client.download_file()
                # Write the stream to the local file
                data.write(stream.readall())

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_DownloadFile>

    # <Snippet_CreateSnapshot>
    def create_snapshot(self, connection_string, share_name):
        try:
            # Create a ShareClient from a connection string
            share_client = ShareClient.from_connection_string(
                connection_string, share_name)

            # Create a snapshot
            snapshot = share_client.create_snapshot()
            print("Created snapshot:", snapshot["snapshot"])

            # Return the snapshot time so 
            # it can be accessed later
            return snapshot["snapshot"]

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_CreateSnapshot>

    # <Snippet_ListSharesAndSnapshots>
    def list_shares_snapshots(self, connection_string):
        try:
            # <Snippet_CreateShareServiceClient>
            # Create a ShareServiceClient from a connection string
            service_client = ShareServiceClient.from_connection_string(connection_string)
            # </Snippet_CreateShareServiceClient>

            # List the shares in the file service
            shares = list(service_client.list_shares(include_snapshots=True))

            for share in shares:
                if (share["snapshot"]):
                    print("Share:", share["name"], "Snapshot:", share["snapshot"])
                else:
                    print("Share:", share["name"])

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_ListSharesAndSnapshots>

    def get_first_snapshot(self, connection_string):
        try:
            # Create a ShareServiceClient from a connection string
            service_client = ShareServiceClient.from_connection_string(connection_string)

            # List the shares in the file service
            shares = list(service_client.list_shares(include_snapshots=True))

            for share in shares:
                if (share["snapshot"]):
                    return share["snapshot"]

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)

    # <Snippet_BrowseSnapshotDir>
    def browse_snapshot_dir(self, connection_string, share_name, snapshot_time, dir_name):
        try:
            # Create a ShareClient from a connection string
            snapshot = ShareClient.from_connection_string(
                conn_str=connection_string, share_name=share_name, snapshot=snapshot_time)

            print("Snapshot:", snapshot_time)

            for item in list(snapshot.list_directories_and_files(dir_name)):
                if item["is_directory"]:
                    print("Directory:", item["name"])
                else:
                    print("File:", dir_name + "/" + item["name"])

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_BrowseSnapshotDir>

    # <Snippet_DownloadSnapshotFile>
    def download_snapshot_file(self, connection_string, share_name, snapshot_time, dir_name, file_name):
        try:
            # Build the remote path
            source_file_path = dir_name + "/" + file_name

            # Add a prefix to the local filename to 
            # indicate it's a file from a snapshot
            dest_file_name = "SNAPSHOT-" + file_name

            # Create a ShareFileClient from a connection string
            snapshot_file_client = ShareFileClient.from_connection_string(
                conn_str=connection_string, share_name=share_name, 
                file_path=source_file_path, snapshot=snapshot_time)

            print("Downloading to:", dest_file_name)

            # Open a file for writing bytes on the local system
            with open(dest_file_name, "wb") as data:
                # Download the file from Azure into a stream
                stream = snapshot_file_client.download_file()
                # Write the stream to the local file
                data.write(stream.readall())

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_DownloadSnapshotFile>

    # <Snippet_DeleteSnapshot>
    def delete_snapshot(self, connection_string, share_name, snapshot_time):
        try:
            # Create a ShareClient for a snapshot
            snapshot_client = ShareClient.from_connection_string(conn_str=connection_string, share_name=share_name, snapshot=snapshot_time)

            print("Deleting snapshot:", snapshot_time)

            # Delete the snapshot
            snapshot_client.delete_share()

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_DeleteSnapshot>

    # <Snippet_DeleteFile>
    def delete_azure_file(self, connection_string, share_name, file_path):
        try:
            # Create a ShareFileClient from a connection string
            file_client = ShareFileClient.from_connection_string(
                connection_string, share_name, file_path)

            print("Deleting file:", share_name + "/" + file_path)

            # Delete the file
            file_client.delete_file()

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_DeleteFile>

    # <Snippet_DeleteShare>
    def delete_share(self, connection_string, share_name):
        try:
            # Create a ShareClient from a connection string
            share_client = ShareClient.from_connection_string(
                connection_string, share_name)

            print("Deleting share:", share_name)

            # Delete the share and snapshots
            share_client.delete_share(delete_snapshots=True)

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError:", ex.message)
    # </Snippet_DeleteShare>

    def menu(self):
        os.system("cls")
        print("Choose an Azure Files scenario:")
        print("1) Create a file share")
        print("2) Create a directory")
        print("3) Upload a file")
        print("4) List files and directories")
        print("5) Download a file")
        print("6) Create a share snapshot")
        print("7) List shares and snapshots")
        print("8) Browse share snapshot")
        print("9) Download a file from a snapshot")
        print("10) Delete a snapshot")
        print("11) Delete a file")
        print("12) Delete a share with snapshots")
        print("X) Exit to main menu")
        option = input("\r\nSelect an option: ")

        if option == "1":
            # Create a file share
            self.create_file_share(self.constants.connection_string, self.constants.share_name)
            input("Press Enter to continue ")
            return True
        elif option == "2":
            # Create a directory in the file share
            self.create_directory(self.constants.connection_string, self.constants.share_name, self.constants.dir_name)
            input("Press Enter to continue ")
            return True
        elif option == "3":
            # Upload a local file
            dest_file_path = self.constants.dir_name + "/" + self.constants.file_name
            self.upload_local_file(self.constants.connection_string, self.constants.file_name, self.constants.share_name, dest_file_path)
            input("Press Enter to continue ")
            return True
        elif option == "4":
            # List the files and directories in the specified directory
            self.list_files_and_dirs(self.constants.connection_string, self.constants.share_name, self.constants.dir_name)
            input("Press Enter to continue ")
            return True
        elif option == "5":
            # Download a file
            self.download_azure_file(self.constants.connection_string, self.constants.share_name, self.constants.dir_name, self.constants.file_name)
            input("Press Enter to continue ")
            return True
        elif option == "6":
            # Create a share snapshot, store the snapshot for later use
            self.snapshot_time = self.create_snapshot(self.constants.connection_string, self.constants.share_name)
            input("Press Enter to continue ")
            return True
        elif option == "7":
            # List the file shares in a storage account
            self.list_shares_snapshots(self.constants.connection_string)
            input("Press Enter to continue ")
            return True
        elif option == "8":
            # List files and directories in a snapshot directory
            snapshot = self.get_first_snapshot(self.constants.connection_string)
            self.browse_snapshot_dir(self.constants.connection_string, self.constants.share_name, snapshot, self.constants.dir_name)
            input("Press Enter to continue ")
            return True
        elif option == "9":
            # Download a file from a snapshot
            snapshot = self.get_first_snapshot(self.constants.connection_string)
            self.download_snapshot_file(self.constants.connection_string, self.constants.share_name, snapshot, self.constants.dir_name, self.constants.file_name)
            input("Press Enter to continue ")
            return True
        elif option == "10":
            # Delete a snapshot
            snapshot = self.get_first_snapshot(self.constants.connection_string)
            self.delete_snapshot(self.constants.connection_string, self.constants.share_name, snapshot)
            input("Press Enter to continue ")
            return True
        elif option == "11":
            # Delete a file in a share
            file_path = self.constants.dir_name + "/" + self.constants.file_name
            self.delete_azure_file(self.constants.connection_string, self.constants.share_name, file_path)
            input("Press Enter to continue ")
            return True
        elif option == "12":
            # Delete a file share with snapshots
            self.delete_share(self.constants.connection_string, self.constants.share_name)
            input("Press Enter to continue ")
            return True
        elif option == "x" or option == "X":
            return False
        else:
            print("Unknown option:", str(option))
            input("Press Enter to continue ")
            return True
