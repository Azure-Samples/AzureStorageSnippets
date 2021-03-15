package com.datalake.manage;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class App 
{
    public static void main(String[] args) throws java.lang.Exception{

        try {



            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

            while (true) {

                // Listening for commands from the console
                System.out.print("\033[H\033[2J");  
                System.out.flush();
                System.out.println("Choose a feature area:");

                System.out.println("(1) CRUD operations for accounts with a hierarchical namespace " + 
                               "(2) Access Control Lists (ACL) for accounts with a hierarchical namespace | " +
                               " (3) Blob security | (4) Exit");
                  
                String input = reader.readLine();

                switch(input){

                    case "1":
                        CRUD_DataLake crud_DataLake = new CRUD_DataLake();
                        crud_DataLake.ShowMenu();
                    break;
                    case "2":
                        ACL_DataLake acl_DataLake = new ACL_DataLake();
                        acl_DataLake.ShowMenu();
                    break;
                    case "3":
                        Security security = new Security();
                        security.ShowMenu();
                break;
                    case "4":
                        System.out.println("Cleaning up the sample and exiting!");
                        System.exit(0);
                        break;
                    default:
                        break;
                }
            }
        } catch (java.lang.Exception e) {
            System.out.println(e.toString());
            System.exit(-1);

        }

    }

}
