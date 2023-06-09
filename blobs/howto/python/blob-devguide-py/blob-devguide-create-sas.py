import datetime
import os, uuid
from azure.identity import DefaultAzureCredential
from azure.storage.blob import (
    BlobServiceClient,
    ContainerClient,
    BlobClient,
    BlobSasPermissions,
    ResourceTypes,
    AccountSasPermissions,
    UserDelegationKey,
    generate_account_sas,
    generate_container_sas,
    generate_blob_sas
)

class SASSamples(object):

    # <Snippet_create_account_sas>
    def create_account_sas(self, account_name: str, account_key: str):
        # Create an account SAS that's valid for one day
        start_time = datetime.datetime.now(datetime.timezone.utc)
        expiry_time = start_time + datetime.timedelta(days=1)

        # Define the SAS token permissions
        sas_permissions=AccountSasPermissions(read=True)

        # Define the SAS token resource types
        # For this example, we grant access to service-level APIs
        sas_resource_types=ResourceTypes(service=True)

        sas_token = generate_account_sas(
            account_name=account_name,
            account_key=account_key,
            resource_types=sas_resource_types,
            permission=sas_permissions,
            expiry=expiry_time,
            start=start_time
        )

        return sas_token
    # </Snippet_create_account_sas>

    def use_account_sas(self, blob_service_client: BlobServiceClient):
        account_name = blob_service_client.account_name
        account_key = blob_service_client.credential.account_key
        sas_token = self.create_account_sas(account_name=account_name, account_key=account_key)

        # <Snippet_use_account_sas>
        # The SAS token string can be appended to the account URL with a ? delimiter
        # or passed as the credential argument to the client constructor
        account_sas_url = f"{blob_service_client.url}?{sas_token}"
        
        # Create a BlobServiceClient object
        blob_service_client_sas = BlobServiceClient(account_url=account_sas_url)
        # </Snippet_use_account_sas>

    # <Snippet_request_user_delegation_key>
    def request_user_delegation_key(self, blob_service_client: BlobServiceClient) -> UserDelegationKey:
        # Get a user delegation key that's valid for 1 day
        delegation_key_start_time = datetime.datetime.now(datetime.timezone.utc)
        delegation_key_expiry_time = delegation_key_start_time + datetime.timedelta(days=1)

        user_delegation_key = blob_service_client.get_user_delegation_key(
            key_start_time=delegation_key_start_time,
            key_expiry_time=delegation_key_expiry_time
        )

        return user_delegation_key
    # </Snippet_request_user_delegation_key>

    # <Snippet_create_user_delegation_sas_blob>
    def create_user_delegation_sas_blob(self, blob_client: BlobClient, user_delegation_key: UserDelegationKey):
        # Create a SAS token that's valid for one day, as an example
        start_time = datetime.datetime.now(datetime.timezone.utc)
        expiry_time = start_time + datetime.timedelta(days=1)

        sas_token = generate_blob_sas(
            account_name=blob_client.account_name,
            container_name=blob_client.container_name,
            blob_name=blob_client.blob_name,
            user_delegation_key=user_delegation_key,
            permission=BlobSasPermissions(read=True),
            expiry=expiry_time,
            start=start_time
        )

        return sas_token
    # </Snippet_create_user_delegation_sas_blob>

    def use_user_delegation_sas_blob(self, blob_service_client: BlobServiceClient):
        user_delegation_key = self.request_user_delegation_key(blob_service_client=blob_service_client)

        blob_client = blob_service_client.get_blob_client(container="sample-container", blob="sample-blob.txt")
        sas_token = self.create_user_delegation_sas_blob(blob_client=blob_client, user_delegation_key=user_delegation_key)

        # <Snippet_use_user_delegation_sas_blob>
        # The SAS token string can be appended to the resource URL with a ? delimiter
        # or passed as the credential argument to the client constructor
        sas_url = f"{blob_client.url}?{sas_token}"
        
        # Create a BlobClient object with SAS authorization
        blob_client_sas = BlobClient.from_blob_url(blob_url=sas_url)
        # </Snippet_use_user_delegation_sas_blob>

    # <Snippet_create_user_delegation_sas_container>
    def create_user_delegation_sas_container(self, container_client: ContainerClient, user_delegation_key: UserDelegationKey):
        # Create a SAS token that's valid for one day, as an example
        start_time = datetime.datetime.now(datetime.timezone.utc)
        expiry_time = start_time + datetime.timedelta(days=1)

        sas_token = generate_container_sas(
            account_name=container_client.account_name,
            container_name=container_client.container_name,
            user_delegation_key=user_delegation_key,
            permission=BlobSasPermissions(read=True),
            expiry=expiry_time,
            start=start_time
        )

        return sas_token
    # </Snippet_create_user_delegation_sas_container>

    def use_user_delegation_sas_container(self, blob_service_client: BlobServiceClient):
        user_delegation_key = self.request_user_delegation_key(blob_service_client=blob_service_client)

        container_client = blob_service_client.get_container_client(container="sample-container")
        sas_token = self.create_user_delegation_sas_container(container_client=container_client, user_delegation_key=user_delegation_key)

        # <Snippet_use_user_delegation_sas_container>
        # The SAS token string can be appended to the resource URL with a ? delimiter
        # or passed as the credential argument to the client constructor
        sas_url = f"{container_client.url}?{sas_token}"
        
        # Create a ContainerClient object with SAS authorization
        container_client_sas = ContainerClient.from_container_url(container_url=sas_url)
        # </Snippet_use_user_delegation_sas_container>

    # <Snippet_create_service_sas_container>
    def create_service_sas_container(self, container_client: ContainerClient, account_key: str):
        # Create a SAS token that's valid for one day, as an example
        start_time = datetime.datetime.now(datetime.timezone.utc)
        expiry_time = start_time + datetime.timedelta(days=1)

        sas_token = generate_container_sas(
            account_name=container_client.account_name,
            container_name=container_client.container_name,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=expiry_time,
            start=start_time
        )

        return sas_token
    # </Snippet_create_service_sas_container>

    def use_service_sas_container(self, blob_service_client: BlobServiceClient):
        container_client = blob_service_client.get_container_client(container="sample-container")
        # Assumes the service client object was created with a shared access key
        sas_token = self.create_service_sas_container(container_client=container_client, account_key=blob_service_client.credential.account_key)

        # <Snippet_use_service_sas_container>
        # The SAS token string can be appended to the resource URL with a ? delimiter
        # or passed as the credential argument to the client constructor
        sas_url = f"{container_client.url}?{sas_token}"
        
        # Create a ContainerClient object with SAS authorization
        container_client_sas = ContainerClient.from_container_url(container_url=sas_url)
        # </Snippet_use_service_sas_container>

    # <Snippet_create_service_sas_blob>
    def create_service_sas_blob(self, blob_client: BlobClient, account_key: str):
        # Create a SAS token that's valid for one day, as an example
        start_time = datetime.datetime.now(datetime.timezone.utc)
        expiry_time = start_time + datetime.timedelta(days=1)

        sas_token = generate_blob_sas(
            account_name=blob_client.account_name,
            container_name=blob_client.container_name,
            blob_name=blob_client.blob_name,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=expiry_time,
            start=start_time
        )

        return sas_token
    # </Snippet_create_service_sas_blob>

    def use_service_sas_blob(self, blob_service_client: BlobServiceClient):
        blob_client = blob_service_client.get_blob_client(container="sample-container", blob="sample-blob.txt")
        # Assumes the service client object was created with a shared access key
        sas_token = self.create_service_sas_blob(blob_client=blob_client, account_key=blob_service_client.credential.account_key)

        # <Snippet_use_service_sas_blob>
        # The SAS token string can be appended to the resource URL with a ? delimiter
        # or passed as the credential argument to the client constructor
        sas_url = f"{blob_client.url}?{sas_token}"
        
        # Create a BlobClient object with SAS authorization
        blob_client_sas = BlobClient.from_blob_url(blob_url=sas_url)
        # </Snippet_use_service_sas_blob>

if __name__ == '__main__':
    sample = SASSamples()

    # TODO: Replace <storage-account-name> with your actual storage account name
    account_url = "https://<storage-account-name>.blob.core.windows.net"
    blob_service_client = BlobServiceClient(account_url, credential=DefaultAzureCredential())
    
    sample.use_user_delegation_sas_blob(blob_service_client=blob_service_client)
    sample.use_user_delegation_sas_container(blob_service_client=blob_service_client)

    account_url = "https://<storage-account-name>.blob.core.windows.net"
    account_key = "<account-key>"
    blob_service_client_account_key = BlobServiceClient(account_url, credential=account_key)

    sample.use_service_sas_container(blob_service_client=blob_service_client_account_key)
    sample.use_service_sas_blob(blob_service_client=blob_service_client_account_key)
    sample.use_account_sas(blob_service_client=blob_service_client_account_key)