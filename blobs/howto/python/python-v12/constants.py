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

class Constants:
    """ Contains constants that are used to connect to Azure resources.
        IMPORTANT! Be sure to remove sensitive account information from this file before committing."""

    def __init__(self):
        super().__init__()

        # Credential constants
        self.account_key = ""
        self.connection_string = ""
        
        # Account constants
        self.subscription = ""
        self.resource_id = ""
        self.storage_account_name = ""

        # Resource constants
        self.container_name = ""
        self.blob_name = ""
