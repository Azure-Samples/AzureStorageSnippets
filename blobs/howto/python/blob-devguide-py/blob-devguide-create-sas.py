import datetime
import os, uuid
from azure.identity import DefaultAzureCredential
from azure.storage.blob import (
    BlobServiceClient,
    ContainerClient,
    BlobClient,
    BlobSasPermissions,
    generate_account_sas,
    ResourceTypes,
    AccountSasPermissions,
    generate_blob_sas
)

class SASSamples(object):

    # <Snippet_get_service_client_DAC>
    def get_blob_service_client_token_credential(self):
        # TODO: Replace <storage-account-name> with your actual storage account name
        account_url = "https://<storage-account-name>.blob.core.windows.net"
        credential = DefaultAzureCredential()

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential)

        return blob_service_client
    # </Snippet_get_service_client_DAC>

    # <Snippet_get_service_client_SAS>
    def get_blob_service_client_sas(self, sas_token: str):
        # TODO: Replace <storage-account-name> with your actual storage account name
        account_url = "https://<storage-account-name>.blob.core.windows.net"
        # The SAS token string can be assigned to credential here or appended to the account URL
        credential = sas_token

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential)

        return blob_service_client
    # </Snippet_get_service_client_SAS>

    # <Snippet_get_service_client_account_key>
    def get_blob_service_client_account_key(self):
        # TODO: Replace <storage-account-name> with your actual storage account name
        account_url = "https://<storage-account-name>.blob.core.windows.net"
        shared_access_key = os.getenv("AZURE_STORAGE_ACCESS_KEY")
        credential = shared_access_key

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url, credential=credential)

        return blob_service_client
    # </Snippet_get_service_client_account_key>

    # <Snippet_create_account_sas>
    def create_account_sas(self, blob_service_client: BlobServiceClient):
        # Create a SAS token that's valid for one hour
        
        # Define SAS token expiry time
        expiry_time=datetime.utcnow() + timedelta(hours=1)

        # Define the SAS token permissions
        sas_permissions=AccountSasPermissions(read=True)

        # Define the SAS token resource types
        sas_resource_types=ResourceTypes(container=True)

        sas_token = generate_account_sas(
            blob_service_client.account_name,
            account_key=blob_service_client.credential.account_key,
            resource_types=sas_resource_types,
            permission=sas_permissions,
            expiry=datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            start=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
        )

        return sas_token
    # </Snippet_create_account_sas>

    # <Snippet_create_account_sas>
    def create_account_sas(self, blob_service_client: BlobServiceClient):
        # Create a SAS token that's valid for one hour
        
        # Define SAS token expiry time
        expiry_time=datetime.utcnow() + timedelta(hours=1)

        # Define the SAS token permissions
        sas_permissions=AccountSasPermissions(read=True)

        # Define the SAS token resource types
        sas_resource_types=ResourceTypes(container=True)

        sas_token = generate_account_sas(
            blob_service_client.account_name,
            account_key=blob_service_client.credential.account_key,
            resource_types=sas_resource_types,
            permission=sas_permissions,
            expiry=datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            start=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
        )

        return sas_token
    # </Snippet_create_account_sas>

    # <Snippet_create_service_sas_container>

    # </Snippet_create_service_sas_container>

    # <Snippet_create_user_delegation_sas_container>
    sas_token = self.generate_user_delegation_sas(blob_service_client=blob_service_client, source_blob=source_blob)
    source_blob_sas_url = source_blob.url + "?" + sas_token
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
    # </Snippet_create_user_delegation_sas_container>

if __name__ == '__main__':
    sample = SASSamples()
    blob_service_client = sample.get_blob_service_client_token_credential()
    #blob_service_client = sample.get_blob_service_client_sas(sas_token=<sas_token_str>)
    blob_service_client = sample.get_blob_service_client_account_key()