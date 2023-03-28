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

def menu():  

      initialize_storage_account(storage_account_name, storage_account_key)
    
      command = '0'

      while command != 'X':

        os.system("cls")
        print("Choose a security scenario:")
        print("1) Get and set directory-level permissions")
        print("2) Get and set file-level permissions")
        print("3) Set ACLs recursively")
        print("4) Update ACLs recursively")
        print("5) Remove ACLs recursively")
        print("6) Continue past failure")
        print("7) Resume after failure with token")
        print("X) Exit to main menu")

        option = input("\r\nSelect an option: ")

        if option == "1":
            manage_directory_permissions()
            input("Press Enter to continue ")
            return True
        elif option == "2":
            manage_file_permissions()
            input("Press Enter to continue ")
            return True
        elif option == "3":
            set_permission_recursively(False)
            input("Press Enter to continue ")
            return True
        elif option == "4":
            update_permission_recursively(False)
            input("Press Enter to continue ")
            return True
        elif option == "5":
            remove_permission_recursively(False)
            input("Press Enter to continue ")
            return True
        elif option == "6":
            continue_on_failure()
            input("Press Enter to continue ")
            return True
        elif option == "7":
            resume_set_acl_recursive(None)
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
def initialize_storage_account(storage_account_name, storage_account_key):
    
    try:  
        global service_client

        service_client = DataLakeServiceClient(account_url="{}://{}.dfs.core.windows.net".format(
            "https", storage_account_name), credential=storage_account_key)
    
    except Exception as e:
        print(e)


# -------------------------------------------------
# Connect to account - Azure AD
# -------------------------------------------------
def initialize_storage_account_ad(storage_account_name, client_id, client_secret, tenant_id):
    
    try:  
        global service_client

        credential = ClientSecretCredential(tenant_id, client_id, client_secret)

        service_client = DataLakeServiceClient(account_url="{}://{}.dfs.core.windows.net".format(
            "https", storage_account_name), credential=credential)
    
    except Exception as e:
        print(e)


# -------------------------------------------------
# Manage directory permissions
# ------------------------------------------------

# <Snippet_ACLDirectory>
def manage_directory_permissions():
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-file-system")

        directory_client = file_system_client.get_directory_client("my-directory")
        
        acl_props = directory_client.get_access_control()
        
        print(acl_props['permissions'])
        
        new_dir_permissions = "rwxr-xrw-"
        
        directory_client.set_access_control(permissions=new_dir_permissions)
        
        acl_props = directory_client.get_access_control()
        
        print(acl_props['permissions'])
    
    except Exception as e:
     print(e)   
# </Snippet_ACLDirectory>

# -------------------------------------------------
# Manage file permissions
# ------------------------------------------------

# <Snippet_FileACL>
def manage_file_permissions():
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-file-system")

        directory_client = file_system_client.get_directory_client("my-directory")
        
        file_client = directory_client.get_file_client("uploaded-file.txt")

        acl_props = file_client.get_access_control()
        
        print(acl_props['permissions'])
        
        new_file_permissions = "rwxr-xrw-"
        
        file_client.set_access_control(permissions=new_file_permissions)
        
        acl_props = file_client.get_access_control()
        
        print(acl_props['permissions'])

    except Exception as e:
     print(e) 
# </Snippet_FileACL>

# -------------------------------------------------
# Set ACLs recursively
# ------------------------------------------------

# <Snippet_SetACLRecursively>
def set_permission_recursively(is_default_scope):
    
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-container")

        directory_client = file_system_client.get_directory_client("my-parent-directory")

        acl = 'user::rwx,group::r-x,other::r--,user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:r--'   

        if is_default_scope:
           acl = 'default:user::rwx,default:group::r-x,default:other::r--,default:user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:r--'

        directory_client.set_access_control_recursive(acl=acl)
        
        acl_props = directory_client.get_access_control()
        
        print(acl_props['permissions'])

    except Exception as e:
     print(e) 
# </Snippet_SetACLRecursively>

# -------------------------------------------------
# Update ACLs recursively
# ------------------------------------------------

# <Snippet_UpdateACLsRecursively>
def update_permission_recursively(is_default_scope):
    
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-container")

        directory_client = file_system_client.get_directory_client("my-parent-directory")
              
        acl = 'user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:rwx'   

        if is_default_scope:
           acl = 'default:user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:rwx'

        directory_client.update_access_control_recursive(acl=acl)

        acl_props = directory_client.get_access_control()
        
        print(acl_props['permissions'])

    except Exception as e:
     print(e)
# </Snippet_UpdateACLsRecursively>
     
# -------------------------------------------------
# Remove ACLs recursively
# ------------------------------------------------

# <Snippet_RemoveACLRecursively>
def remove_permission_recursively(is_default_scope):
    
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-container")

        directory_client = file_system_client.get_directory_client("my-parent-directory")
              
        acl = 'user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

        if is_default_scope:
           acl = 'default:user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

        directory_client.remove_access_control_recursive(acl=acl)

    except Exception as e:
     print(e)
# </Snippet_RemoveACLRecursively>

# -------------------------------------------------
# Continue on failure
# ------------------------------------------------

# <Snippet_ContinueOnFailure>
def continue_on_failure():
    
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-container")

        directory_client = file_system_client.get_directory_client("my-parent-directory")
              
        acl = 'user::rwx,group::rwx,other::rwx,user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:r--'

        acl_change_result = directory_client.set_access_control_recursive(acl=acl)

        print("Summary: {} directories and {} files were updated successfully, {} failures were counted."
          .format(acl_change_result.counters.directories_successful, acl_change_result.counters.files_successful,
                  acl_change_result.counters.failure_count))
        
    except Exception as e:
     print(e) 
# </Snippet_ContinueOnFailure>

# -------------------------------------------------
# Continuation token
# ------------------------------------------------

# <Snippet_ResumeContinuationToken>
def resume_set_acl_recursive(continuation_token):
    
    try:
        file_system_client = service_client.get_file_system_client(file_system="my-container")

        directory_client = file_system_client.get_directory_client("my-parent-directory")
              
        acl = 'user::rwx,group::rwx,other::rwx,user:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:r--'

        acl_change_result = directory_client.set_access_control_recursive(acl=acl, continuation=continuation_token)

        continuation_token = acl_change_result.continuation

        return continuation_token
        
    except Exception as e:
     print(e) 
     return continuation_token
# </Snippet_ResumeContinuationToken>

# Main method.
if __name__ == '__main__':
    menu()
