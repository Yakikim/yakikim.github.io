---
layout: mynote
tags: [notes, memo, op] 
created: 2021-06-21 13:38
modified: 2021-06-21 13:38
type: Document
title: AOP Requirements  2021-06-21
---
Week Of: [[2021-06-20]]
[[2021-06-21]]

#  AOP Requirements

[[home]]/[[Open University]]/[[Memos]]

## רקע\תיאור
ע"מ לקדם התקנת שרת הדפסות AOP, שגיב ביקש שאאסוף מידע לגבי דרישות סף חומרתיות וקושחתיות הנדרשות להתקנת שרת ה-AOP - Apex Office Print
ההמלצות הבאות הינן ע"פ המסמך הרשמי של [APEX Office Print](https://www.apexofficeprint.com/docs/index.html#hardware-requirements)
##  דרישות סף - חומרה
| Option   | CPU     | RAM  | Harddisk |
| --- | ------- | ---- | -------- |
| ++   | 4 Cores | 32GB | at least 2GB      |
| +   |   4 Cores | 20GB | at least 2GB      |
> הסבר:
> ניתן להתקין גם גרסת מערכת קלה יותר עם זיכרון פנימי של 6GB RAM  אבל מכיון ומנסיוני על תחנת המחשב שלי (לא מייצג, אבל נבדק גם ללא עומס על מערכת ההפעלה) ונצפו זמני עיבוד לא מיטביים.
> כל אחת מן האפשרויות הנ"ל דורשות קבצי התקנה שונים.  

## דרישות סף - קושחה
- Linux (7 and higher)
> הסבר: ישנן כמה אפשרויות, בהתחשב בהיבטי זמינות, היכרות, ועלות, האופציה של לינוקס הינה המועדפת. האפשרויות הן: 
> - Linux (7 and higher)
> - Windows (2012 and higher)
> - Docker
> - Oracle Cloud
## דרישות תוכנה  
-  LibreOffice(6 or higher) 
- Java JDK (1.8 or higher)


	
# Installation process
```
# create AOP directory
mkdir /opt/aop

# unzip 
unzip aop_linux_v21.1_hm.zip -d /opt/aop

# create symbolic link for latest directory (see further for more explanation)
ln -s /opt/aop/v21.1 /opt/aop/latest

# give permissions to executable
chmod 755 /opt/aop/latest/server/APEXOfficePrintLinux64
```

In order for AOP to convert PDFs it relies on LibreOffice (6 or higher) and Java, so both of those should be available on the server. You find step-by-step instructions how to verify if the pre-requisites are met and how to install those.

### Install LibreOffice

Verify if LibreOffice is already installed on your system:

```
$ soffice --version
LibreOffice 7.0.5.2 0c292870b25a325b5ed35f6b45599d2ea4458e77

$ java -version
openjdk version "1.8.0_282"
OpenJDK Runtime Environment (build 1.8.0_282-b08)
OpenJDK 64-Bit Server VM (build 25.282-b08, mixed mode)
```

In case you need to install [LibreOffice](https://www.libreoffice.org/download/libreoffice-fresh/) and Java you can follow the next steps.

```
# install supporting packages
yum install wget

# download LibreOffice for the PDF converter (or copy to the server)
# note that sometimes you have to retry in order for it to download
cd /tmp
wget https://download.documentfoundation.org/libreoffice/stable/7.0.5/rpm/x86_64/LibreOffice_7.0.5_Linux_x86-64_rpm.tar.gz

# make sure no old versions exist
yum remove openoffice* libreoffice*

# install LibreOffice
# extract tar
tar -xvf LibreOffice_7.0.5_Linux_x86-64_rpm.tar.gz

# install via yum
cd /tmp/LibreOffice_7.0.5.2_Linux_x86-64_rpm/RPMS/
yum -y localinstall *.rpm
# alternative to above you can do: rpm -ivh *.rpm

# optional: install some missing dependencies (depending your linux version this is not necessary)
# Note if the below fails; you can add the Oracle repo:
# cd /etc/yum.repos.d/
# wget http://yum.oracle.com/public-yum-ol7.repo
yum -y install cairo.x86_64
yum -y install cups.x86_64 --skip-broken
yum -y install mesa-libGL.x86_64

# optional: install Java dependency (not necessary if you already have Java)
yum -y install java-1.8.0-openjdk.x86_64

# make soffice available to your user
# option 1 (recommended): create symbolic link
ln -s /opt/libreoffice7.0/program/soffice /usr/sbin/soffice

# run LibreOffice for the first time, this will create the default home directory of LibreOffice
soffice

# CTRL-C to exit

# The following steps are OPTIONAL
# option 2 (alternative): add LibreOffice to the profile for your user (as it needs to be able to find soffice)
# if you did option 1, this is not necessary
vi /etc/profile
export PATH=$PATH:/opt/libreoffice7.0/program
source /etc/profile

# check the version of LibreOffice and try to run a conversion
soffice --version
soffice --headless --invisible --convert-to pdf --outdir /tmp /tmp/LibreOffice_7.0.5.2_Linux_x86-64_rpm/readmes/README_en-US

# if you get: Fontconfig warning: ignoring UTF-8: not a valid region tag
echo "$LC_CTYPE"
# |-> you probably have UTF-8 defined; unset it
export LC_CTYPE=""

# optional: cleanup LibreOffice install
# rm -rf LibreOffice_7.0.5.2_Linux_x86-64_rpm/
# rm -f LibreOffice_7.0.5_Linux_x86-64_rpm.tar.gz
```

## Installation of fonts

To install the most used Microsoft fonts, execute following commands:

```
rpm -i https://yum.oracle.com/repo/OracleLinux/OL7/developer_EPEL/x86_64/getPackage/cabextract-1.9-7.el7.x86_64.rpm
yum -y install rpm-build cabextract ttmkfdir fontconfig
rpm -i https://downloads.sourceforge.net/project/mscorefonts2/rpms/msttcore-fonts-installer-2.6-1.noarch.rpm
fc-cache -fv
```

If you need special characters or language support, make sure the necessary fonts and languages are on your system. For example to add Chinese support do:

```
    yum install "@Chinese Support"
```

Further more if you want to install additional fonts here's a good [link](http://mscorefonts2.sourceforge.net/). AOP Cloud API has [Google Noto](https://www.google.com/get/noto/) fonts installed.

Installing a font is nothing more than installing the font on your system. For example on (RedHat) Linux, we copy the \*.ttf files (or directory) to /usr/share/fonts/ and run "fc-cache -f -v"

For barcodes, you could also choose to install a barcode font, for example [Free 3of9](https://www.barcodesinc.com/free-barcode-font/) or [http://www.dafont.com/3of9-barcode.font](http://www.dafont.com/3of9-barcode.font). Barcode fonts are more performant than images.

If you are using font awesome and using html tag or interactive reports/grid in Word, you will have to install the font-awesome desktop fonts in order to render on the PDFs properly.

#aop
#apex
#op/apex/infrastractures 
#memo 
#op/memo