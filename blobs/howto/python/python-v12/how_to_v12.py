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

from copy_blob import CopyBlob
from list_blobs import ListBlobs
import os

def copy_blobs():
    copyblob = CopyBlob()

    while (copyblob.menu()):
        pass

    return True

def list_blobs():
    listblobs = ListBlobs()

    while (listblobs.menu()):
        pass

    return True

def main():
    def main_menu():
        os.system("cls")

        print("Choose a feature area:")
        print("1) Copy a blob")
        print("2) List blobs")
        print("3) Empty")
        print("4) Empty")
        print("X) Exit")

        option = input("\r\nSelect an option: ")

        if option == "1":
            return copy_blobs()
        elif option == "2":
            return list_blobs()
        elif option == "3":
            return True
        elif option == "4":
            return True
        elif option == "x" or option == "X":
            return False
        else:
            print("Unknown option: " + option)
            input("Press Enter to continue ")
            return True

    while main_menu():
        pass

    os.system("cls")

if __name__ == "__main__":
    main()
