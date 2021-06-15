---
tags: [putty, devops , commands, ssh]  
created: 2021-04-22 14:49
modified: 2021-05-25 14:09
type: Document
title: Putty
---
[[2021-05-23]]
# PuTTY

[[index.html]]/[[Professional]]





[PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/faq.html#faq-what) is a client program for the SSH on Windows OS.

## Windows PuTTY Installer
We recommend to download [Windows Installer](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) with PuTTY utilities as:
* Pageant (SSH authentication agent) - store private key in memory without need to retype a passphrase on every login
* PuTTYgen (PuTTY key generator) - convert OpenSSH format of id_rsa to PuTTY ppk private key and so on and so forth

## PuTTY - Connect to the Instance

* Run PuTTY and enter Host name in format "login@Floating IP address" where [login](/quick-start#create-virtual-machine-instance) is for example debian for Debian OS and Floating IP is [IP address](/quick-start/#associate-floating-ip) to access instance from internet.
* In Category -> Connection -> SSH -> Auth:
  *  Select **Attempt authentication using Pageant**
  *  Select **Allow agent forwarding**
  *  Browse and select your private key file (if needed [convert OpenSSH format id_rsa to Putty ppk](#convert-openssh-format-to-putty-ppk-format))
* Return to *Session page* and Save selected configuration with **Save** button
* Now you can log in using **Open** button
* Enter passphrase for selected private key file if [Pageant SSH authentication agent](#pageant-ssh-agent) is not used
  *  We recomend using Pageant SSH Agent to store private key in memory without need to retype a passphrase on every login

![](putty-connect2instance.png.md)

## Pageant SSH Agent

* Run Pageant from Windows menu
* Locate Pageant icon in the Notification Area and double click on it
* Use **Add Key** button
* Browse files and select your PuTTY Private Key File in format ppk
* Use **Open** buton
* Eter passphrase and confirm **OK** button
* Your private key is now located in the memory without need to retype a passphrase on every login

![](/putty/images/pageant-add-key.png)

## PuTTY key Generator

PuTTYgen is the PuTTY key generator. You can load in an existing private key and change your passphrase or generate a new public/private key pair or convert to/from OpenSSH/PuTTY ppk formats.

## Convert OpenSSH format to PuTTY ppk format

* Run PuTTYgen, in the menu Conversion -> Import key browse and load your OpenSSH format id_rsa private key using your passphrase
* Save PuTTY ppk private key using button **Save private key**, browse destination for PuTTY format id_rsa.ppk and save file

![](/putty/images/puttygen-openssh2ppk.png)

## Convert PuTTY ppk private key to OpenSSH format

* Run PuTTYgen, in the menu File -> Load private key browse and open your private key in format PuTTY ppk using your passphrase
* In the menu Conversion -> Export OpenSSH key browse destination for OpenSSH format id_rsa and save file

![](/putty/images/puttygen-ppk2openssh.png)

## Change Password for Existing Private Key Pair

* Load your existing private key using button **Load**, confirm opening using your passphrase
* Enter new passphrase in field *Key passphrase* and confirm again in field *Confirm passphrase*
* Save changes using button **Save private key**

![](/putty/images/puttygen-passphrase.png)

## Generate a New Key Pair

* Start with **Generate button**
* Generate some randomness by moving your mouse over dialog
* Wait while the key is generated
* Enter a comment for your key using "your-email@address"
* Enter key passphrase, confirm key passphrase
* Save your new private key in the "id_rsa.ppk" format using the **Save private key** button
* Save the public key with the **Save public key** button

![](/putty/images/puttygen_new_key.png)
