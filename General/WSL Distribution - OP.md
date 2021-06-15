---
tags: [documents, spec, op, po]  
created: 2021-05-03 11:09
modified: 2021-05-25 14:03
type: Document
title: WSL Distribution - OP
---
[[2021-05-23]]
# WSL Distribution - OP

[[index.html]]/ [[Professional]]



## How to install the WSL on windows using PS commands

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

```

4. (Optional) Install your preferred GUI  -[[../Linux GUI]]
5. The root folder of the Linux system is here : ` \\wsl$ `

## Problem with the `apt install` 
The WSL doe'snt know how to deal with proxy configuration and don't get it from the Internet LAN Settings. so that it's required to configure it on the Ubuntu distribution system:
```bash
sudo nano /etc/apt/apt.conf.d/proxy.conf
```
and add these lines:
```
Acquire::http::Proxy "http://147.233.250.10:80";
Acquire::https::Proxy "http://147.233.250.10:80";
```



#wsl #ubuntu #linux #op #solution>)