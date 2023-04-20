import datetime
import time
from azure.identity import DefaultAzureCredential
from azure.storage.blob import (
    BlobServiceClient,
    BlobClient,
    BlobLeaseClient,
    BlobSasPermissions,
    generate_blob_sas
)

class BlobCopySamples(object):

    # <Snippet_copy_blob_from_azure_async>
    def copy_from_source_in_azure_async(self, source_blob: BlobClient, destination_blob: BlobClient, blob_service_client: BlobServiceClient):
        # Lease the source blob during copy to prevent other clients from modifying it
        lease = BlobLeaseClient(client=source_blob)

        sas_token = self.generate_user_delegation_sas(blob_service_client=blob_service_client, source_blob=source_blob)
        source_blob_sas_url = source_blob.url + "?" + sas_token

        # Create an infinite lease by passing -1 as the lease duration
        lease.acquire(lease_duration=-1)

        # Start the copy operation - specify False for the requires_sync parameter
        copy_operation = dict()
        copy_operation = destination_blob.start_copy_from_url(source_url=source_blob_sas_url, requires_sync=False)
        
        # If start_copy_from_url returns copy_status of 'pending', the operation has been started asynchronously
        # You can optionally add logic here to wait for the copy operation to complete

        # Release the lease on the source blob
        lease.break_lease()

    def generate_user_delegation_sas(self, blob_service_client: BlobServiceClient, source_blob: BlobClient):
        # Get a user delegation key
        delegation_key_start_time = datetime.datetime.now(datetime.timezone.utc)
        delegation_key_expiry_time = delegation_key_start_time + datetime.timedelta(hours=1)
        key = blob_service_client.get_user_delegation_key(
            key_start_time=delegation_key_start_time,
            key_expiry_time=delegation_key_expiry_time
        )

        # Create a SAS token that's valid for one hour, as an example
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
    # </Snippet_copy_blob_from_azure_async>

    # <Snippet_copy_blob_external_source_async>
    def copy_from_external_source_async(self, source_url: str, destination_blob: BlobClient):
        # Start the copy operation - specify False for the requires_sync parameter
        copy_operation = dict()
        copy_operation = destination_blob.start_copy_from_url(source_url=source_url, requires_sync=False)
        
        # If start_copy_from_url returns copy_status of 'pending', the operation has been started asynchronously
        # You can optionally add logic here to wait for the copy operation to complete
    # </Snippet_copy_blob_external_source_async>

    # <Snippet_check_copy_status>
    def check_copy_status(self, destination_blob: BlobClient):
        # Get the copy status from the destination blob properties
        copy_status = destination_blob.get_blob_properties().copy.status

        return copy_status
    # </Snippet_check_copy_status>

    # <Snippet_abort_copy>
    def abort_copy(self, destination_blob: BlobClient):
        # Get the copy operation details from the destination blob properties
        copy_status = destination_blob.get_blob_properties().copy.status
        copy_id = destination_blob.get_blob_properties().copy.id

        # Check the copy status and abort if pending
        if copy_status == 'pending':
            destination_blob.abort_copy(copy_id)
            print(f"Copy operation {copy_id} has been aborted")
    # </Snippet_abort_copy>

if __name__ == '__main__':
    # TODO: Replace <storage-account-name> with an actual storage account name
    account_url_src = "https://<storage-account-name>.blob.core.windows.net"
    account_url_dest = "https://<storage-account-name>.blob.core.windows.net"
    credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client_src = BlobServiceClient(account_url_src, credential=credential)
    blob_service_client_dest = BlobServiceClient(account_url_dest, credential=credential)

    sample = BlobCopySamples()

    # Copy a blob from a source in a different storage account
    source = blob_service_client_src.get_blob_client(container="source-container", blob="sample-blob.txt")
    destination = blob_service_client_dest.get_blob_client(container="destination-container", blob="sample-blob.txt")
    sample.copy_from_source_in_azure_async(source_blob=source, destination_blob=destination, blob_service_client=blob_service_client_src)

    # Copy a blob from an external source
    source_url = "<source-url>"
    destination = blob_service_client_dest.get_blob_client(container="destination-container", blob="sample-blob.txt")
    sample.copy_from_external_source_async(source_url=source_url, destination_blob=destination)
    #sample.abort_copy(blob_service_client)