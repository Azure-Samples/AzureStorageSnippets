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

import os, sys

from azure.storage.blob import (
    ContainerClient,
    BlobPrefix
)

from constants import Constants

try:
    CONNECTION_STRING = os.environ['AZURE_STORAGE_CONNECTION_STRING']
except KeyError:
    print("AZURE_STORAGE_CONNECTION_STRING must be set.")
    sys.exit(1)

class ListBlobs:
    def __init__(self):
        super().__init__()
        self.constants = Constants()
        self.containerClient = ContainerClient.from_connection_string(CONNECTION_STRING, self.constants.container_name)

    # <Snippet_ListBlobs>
    # Regular blob listing
    def list_blobs_flat_listing(self, container_client):
        # List blobs in the specified container
        blobs_list = container_client.list_blobs()
        for blob in blobs_list:
            print('Blob: ' + blob.name)

        # Another way of iterating through the list of blobs with fine grain control over page items
        not_finished = True
        blob_list_iter = container_client.list_blobs(results_per_page=2).by_page()
        while not_finished:
            try:
                blob_list = next(blob_list_iter)
                for blob in blob_list:
                    print('Blob: ' + blob.name)
            except StopIteration:
                not_finished = False
    # </Snippet_ListBlobs>


    #<Snippet_WalkHierarchy>
    '''
    List blob hierarchy
    Walk the blobs in a container within a storage account,
    displaying them in a hierarchical structure and, when present, showing
    the number of snapshots that are available per blob.
    '''
    def list_blobs_hierarchical_listing(self, container_client):
        depth = 1
        separator = '   '

        def walk_blob_hierarchy(prefix=""):
            nonlocal depth
            for item in container_client.walk_blobs(name_starts_with=prefix):
                short_name = item.name[len(prefix):]
                if isinstance(item, BlobPrefix):
                    print('Folder: ' + separator * depth + short_name)
                    depth += 1
                    walk_blob_hierarchy(prefix=item.name)
                    depth -= 1
                else:
                    message = 'Blob: ' + separator * depth + short_name
                    results = list(container_client.list_blobs(name_starts_with=item.name, include=['snapshots']))
                    num_snapshots = len(results) - 1
                    if num_snapshots:
                        message += " ({} snapshots)".format(num_snapshots)
                    print(message)
        walk_blob_hierarchy()
    #</Snippet_WalkHierarchy>

    def menu(self):
        os.system("cls")
        print("Choose a list blobs scenario:")
        print("1) List blobs in a container")
        print("2) List container hierarchy")
        print("X) Exit to main menu")
        option = input("\r\nSelect an option: ")

        if option == "1":
            self.list_blobs_flat_listing(self.containerClient)
            input("Press Enter to continue ")
            return True
        elif option == "2":
            self.list_blobs_hierarchical_listing(self.containerClient)
            input("Press Enter to continue ")
            return True
        elif option == "x" or option == "X":
            return False
        else:
            print("Unknown option: " + str(option))
            input("Press Enter to continue ")
            return True
