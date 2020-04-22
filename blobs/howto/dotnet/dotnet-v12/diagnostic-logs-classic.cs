using System;

namespace dotnet_v12
{
    public class DiagnosticLogs
    {
        //-------------------------------------------------
        // Diagnostic log menu
        //-------------------------------------------------
        public bool Menu()
        {
            Console.Clear();
            Console.WriteLine("Choose a diagnostic log scenario:");
            Console.WriteLine("1) Scenario 1");
            Console.WriteLine("2) Scenario 2");
            Console.WriteLine("3) Return to main menu");
            Console.Write("\r\nSelect an option: ");
 
            switch (Console.ReadLine())
            {
                case "1":
                   Console.WriteLine("You chose scenario 1. Press enter to continue");   
                   Console.ReadLine();          
                   return true;
                case "2":
                   Console.WriteLine("You chose scenario 2. Press enter to continue"); 
                   Console.ReadLine();              
                   return true;
                case "3":
                   return false;
                default:
                   return true;
            }
        }
        
    }

    


    
}
