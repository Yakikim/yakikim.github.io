---
tags: [documents, spec, op, po]  
created: 2021-05-03 11:09
modified: 2021-05-25 14:03
type: Document
title: WSL Distribution - OP
---
[[2021-05-23]]
# WSL Distribution - OP
[[index | דף הבית]]/[[אחר]] 



## How to install the WSL on windows using PS commands

1. Run PowerShell **as Administrator**
1. Enable these features:
``` powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart                   
```

```powershell 
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart                              
```
2. Download the OS from the list of distributions [here](https://docs.microsoft.com/en-us/windows/wsl/install-manual): 
``` powershell 
curl.exe -L -o ubuntu-1604.appx https://aka.ms/wsl-ubuntu-1604                 

```
3.  Install the package (appx file)
``` powershell
Add-AppxPackage .\ubuntu-1604.appx                                             ```

```powershell

4. (Optional) Install your preferred GUI  -[[YakisSite/Linux GUI]]
5. The root folder of the Linux system is here : ` \\wsl$ `

## Problem with the `apt install` 
The WSL doe'snt know how to deal with proxy configuration and don't get it from the Internet LAN Settings. so that it's required to configure it on the Ubuntu distribution system:
```bash
sudo nano /etc/apt/apt.conf.d/proxy.conf
```
and add these lines:
```powershell
Acquire::http::Proxy "http://147.233.250.10:80";
Acquire::https::Proxy "http://147.233.250.10:80";
```



#wsl #ubuntu #linux #op #solution>)