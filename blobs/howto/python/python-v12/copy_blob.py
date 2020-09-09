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

# <Snippet_Imports>
import os, uuid

from azure.core.exceptions import (
    ResourceNotFoundError,
    ServiceRequestError
)

from azure.storage.blob import (
    BlobClient,
    BlobLeaseClient,
    BlobProperties,
    ContainerClient,
    CopyProperties
)
# </Snippet_Imports>

from constants import Constants

class CopyBlob:
    def __init__(self):
        super().__init__()
        # Retrieve the connection string from an environment
        # variable named AZURE_STORAGE_CONNECTION_STRING
        self.connect_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.constants = Constants()

    # <Snippet_BlobCopy>
    def blob_copy(self, container_name, blob_name):

        source_blob = BlobClient.from_connection_string(
            os.getenv("AZURE_STORAGE_CONNECTION_STRING"), 
            container_name, blob_name
            )

        try:
            lease = BlobLeaseClient(source_blob)
            lease.acquire()
            source_props = source_blob.get_blob_properties()
            print("Lease state: " + source_props.lease.state)

            dest_blob = BlobClient.from_connection_string(
                os.getenv("AZURE_STORAGE_CONNECTION_STRING"),
                container_name, str(uuid.uuid4()) + "-" + blob_name
                )
            copy_props = dest_blob.start_copy_from_url(source_blob.url)
            print("Copy status: " + copy_props["copy_status"])
            print("Last modified: " + str(copy_props["last_modified"]))

            if (source_props.lease.state == "leased"):
                lease.break_lease()
                source_props = source_blob.get_blob_properties()
                print("Lease state: " + source_props.lease.state)

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError: ", ex.message)

        except ServiceRequestError as ex:
            print("ServiceRequestError: ", ex.message)
    # </Snippet_BlobCopy>

    def stop_blob_copy(self, container_name, blob_name):

        source_blob = BlobClient.from_connection_string(
            os.getenv("AZURE_STORAGE_CONNECTION_STRING"), 
            container_name, blob_name
            )

        try:
            dest_blob = BlobClient.from_connection_string(
                os.getenv("AZURE_STORAGE_CONNECTION_STRING"),
                container_name, str(uuid.uuid4()) + "-" + blob_name
                )

            # <Snippet_StopBlobCopy>
            copy_props = dest_blob.start_copy_from_url(source_blob.url)

            if (copy_props["copy_status"] == "pending"):
                dest_blob.abort_copy(copy_props["copy_id"])
                print("Copy operation " + copy_props["copy_id"] + " has been aborted.")
            # </Snippet_StopBlobCopy>

            print("Copy status: " + copy_props["copy_status"])
            print("Last modified: " + str(copy_props["last_modified"]))

        except ResourceNotFoundError as ex:
            print("ResourceNotFoundError: ", ex.message)

        except ServiceRequestError as ex:
            print("ServiceRequestError: ", ex.message)

    def menu(self):
        os.system("cls")
        print("Choose a blob copy scenario:")
        print("1) Copy an existing blob")
        print("2) Stop blob copy operation")
        print("X) Exit to main menu")
        option = input("\r\nSelect an option: ")

        if option == "1":
            self.blob_copy(self.constants.container_name, self.constants.blob_name)
            input("Press Enter to continue ")
            return True
        elif option == "2":
            self.stop_blob_copy(self.constants.container_name, self.constants.blob_name)
            input("Press Enter to continue ")
            return True
        elif option == "x" or option == "X":
            return False
        else:
            print("Unknown option: " + str(option))
            input("Press Enter to continue ")
            return True
