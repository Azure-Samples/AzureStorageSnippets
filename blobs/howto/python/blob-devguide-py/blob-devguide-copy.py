import datetime
import time
from azure.identity import DefaultAzureCredential
from azure.storage.blob import (
    BlobServiceClient,
    BlobClient,
    ContainerClient,
    BlobLeaseClient,
    BlobSasPermissions,
    BlobServiceSasSignatureValues,
    generate_blob_sas
)

class BlobCopySamples(object):

    # <Snippet_copy_from_azure_put_blob_from_url>
    def copy_from_source_in_azure(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Get the source blob URL and create the destination blob
        # set overwrite param to True if you want to overwrite existing blob data
        destination_blob.upload_blob_from_url(source_url=source_blob.primary_endpoint.url, overwrite=False)
    # </Snippet_copy_from_azure_put_blob_from_url>

    # <Snippet_copy_from_external_source_put_blob_from_url>
    def copy_from_external_source(self, source_url: str, destination_blob: BlobClient):
        # Create the destination blob from the source URL
        # set overwrite param to True if you want to overwrite existing blob data
        destination_blob.upload_blob_from_url(source_url=source_url, overwrite=False)
    # </Snippet_copy_from_external_source_put_blob_from_url>

    # <Snippet_copy_blob_from_azure>
    def copy_from_source_in_azure_async(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Lease the source blob during copy to prevent other clients from modifying it
        lease = BlobLeaseClient(client=source_blob)

        # Create an infinite lease by passing -1 as the lease duration
        lease.acquire(lease_duration=-1)

        # Start the copy operation - specify False for the require_sync parameter
        copy_operation = dict()
        copy_operation = destination_blob.start_copy_from_url(source_url=source_blob.url, requires_sync=False)
        
        # If start_copy_from_url returns copy_status of 'pending', the operation has been started asynchronously
        # Let's wait for the copy operation to complete
        if copy_operation['copy_status'] == 'pending':
            self.wait_for_copy(destination_blob)

        # Release the lease on the source blob
        lease.break_lease()

    def wait_for_copy(self, destination_blob: BlobClient):
        # Get the destination blob properties
        copy_status = destination_blob.get_blob_properties().copy.status

        # Check the copy status and wait if pending
        if copy_status == 'pending':
            count = 0
            # Check the destination blob copy status every 5 seconds, as an example
            while copy_status == 'pending':
                count = count + 1
                # Poll the copy status a certain number of times before taking other actions
                if count > 10:
                    # Alert the user or abort the copy operation
                    break
                time.sleep(5)
                copy_status = destination_blob.get_blob_properties().copy.status

    def generateUserDelegationSAS(blob_service_client: BlobServiceClient, source_blob: BlobClient):
        # Get a user delegation key
        delegation_key_start_time = datetime.datetime.now(datetime.timezone.utc)
        delegation_key_expiry_time = delegation_key_start_time + datetime.timedelta(days=1)
        key = blob_service_client.get_user_delegation_key(
            key_start_time=delegation_key_start_time,
            key_expiry_time=delegation_key_expiry_time
        )

        # Create a SAS token that's valid for one hour
        sas_token = generate_blob_sas(
            account_name=blob_service_client.account_name,
            container_name=source_blob.container_name,
            blob_name=source_blob.blob_name,
            account_key=None,
            user_delegation_key=key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
            start=datetime.datetime.now(datetime.timezone.utc)
        )

        return sas_token
    # </Snippet_copy_blob_from_azure>

    # <Snippet_copy_blob_from_azure>
    def copy_from_source_in_azure_async(self, source_blob: BlobClient, destination_blob: BlobClient):
        # Lease the source blob during copy to prevent other clients from modifying it
        lease = BlobLeaseClient(client=source_blob)

        # Create an infinite lease by passing -1 as the lease duration
        lease.acquire(lease_duration=-1)

        # Start the copy operation - specify False for the require_sync parameter
        copy_operation = dict()
        copy_operation = destination_blob.start_copy_from_url(source_url=source_blob.url, requires_sync=False)
        
        # If start_copy_from_url returns copy_status of 'pending', the operation has been started asynchronously
        # Let's wait for the copy operation to complete
        if copy_operation['copy_status'] == 'pending':
            self.wait_for_copy(destination_blob)

        # Release the lease on the source blob
        lease.break_lease()

    def wait_for_copy(self, destination_blob: BlobClient):
        # Get the destination blob properties
        copy_status = destination_blob.get_blob_properties().copy.status

        # Check the copy status and wait if pending
        if copy_status == 'pending':
            count = 0
            # Check the destination blob copy status every 5 seconds, as an example
            while copy_status == 'pending':
                count = count + 1
                # Poll the copy status a certain number of times before taking other actions
                if count > 10:
                    # Alert the user or abort the copy operation
                    break
                time.sleep(5)
                copy_status = destination_blob.get_blob_properties().copy.status
    # </Snippet_copy_blob_from_azure>

    # <Snippet_abort_copy>
    def abort_copy(self, blob_service_client: BlobServiceClient):
        # Get the destination blob and its properties
        destination_blob = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
        destination_blob_properties = destination_blob.get_blob_properties()

        # Check the copy status and abort if pending
        if destination_blob_properties.copy.status == 'pending':
            destination_blob.abort_copy(destination_blob_properties.copy.id)
            print(f"Copy operation {destination_blob_properties.copy.id} has been aborted")
    # </Snippet_abort_copy>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://pjstorageaccounttest.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(account_url, credential=credential)

    sample = BlobCopySamples()

    source = blob_service_client.get_blob_client(container="source-container", blob="sample-blob.txt")
    destination = blob_service_client.get_blob_client(container="destination-container", blob="sample-blob.txt")
    sample.copy_blob_within_storage_account(source_blob=source, destination_blob=destination)
    #sample.abort_copy(blob_service_client)