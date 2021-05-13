# How to install the WSL on windows using PS commands

1. Run PowerShell **as Administrator**
1. Enable these features:
``` ps
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart                   
```

```ps 
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart                              
```
2. Download the OS from the list of distributions [here](https://docs.microsoft.com/en-us/windows/wsl/install-manual): 
``` ps 
curl.exe -L -o ubuntu-1604.appx https://aka.ms/wsl-ubuntu-1604                 

```
3.  Install the package (appx file)
``` ps
Add-AppxPackage .\ubuntu-1604.appx                                             ```

```me