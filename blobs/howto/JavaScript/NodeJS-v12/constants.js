//----------------------------------------------------------------------------------
// Microsoft Developer & Platform Evangelism
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
// EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
// OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
//----------------------------------------------------------------------------------
// The example companies, organizations, products, domain names,
// e-mail addresses, logos, people, places, and events depicted
// herein are fictitious.  No association with any real company,
// organization, product, domain name, email address, logo, person,
// places, or events is intended or should be inferred.
//----------------------------------------------------------------------------------

// All files in this project can access these values. 
// You won't have to modify the code in your methods to test them. 
// Just update this file with the relevant values.

class Constants {
    constructor () {
        // Credential constants
        this.accountName = "";
        this.accountKey = "";
        this.connectionString = "";
        this.accountKeyAdls = "";
        this.connectionStringAdls = "";
        this.clientSecret = "";
        this.clientID = "";

        // Account constants
        this.tenantID = "";
        this.subscription = "";
        this.resourceID = "";
        this.storageAccountName = "";
        this.storageAccountNameAdls = "";

        // Resource constants
        this.containerName = "";
        this.blobName = "";
        this.directoryName = "";
        this.subDirectoryName = "";
    }
}

module.exports = Constants;