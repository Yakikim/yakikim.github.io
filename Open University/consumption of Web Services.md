---
tags: [apex, op, wiki, guide]  
created: 2021-05-24 16:57
modified: 2021-05-31 14:53
type: Document
title: consumption of Web Services
---

[[2021-01-02]]
# consumption of Web Services


[[index.html]]/[[Open University]]/[[APEX]]/[[Infrastructure]]

## Consumption a ERPDEV WebService within an APX Instance
>NOTE: the next stages will be done at APX instance unless specified otherwise

#### Defining "Web Credentials"

![[23-Nov-20 14-38-51.png]]


#### Creating Web Source Module


![[23-Nov-20 14-52-57.jpg]]
>Next

![[23-Nov-20 14-57-23.jpg]]
>Next

![[23-Nov-20 14-58-29.jpg]]
>Choose the ERPDEV Credentials and click on Discover


![[23-Nov-20 15-00-56.jpg]]

>Click on Create Web Service

#### Display Data from Web Service

>Create some report (this example - Interactive Report) and specify the location as "Web Source"

![[23-Nov-20 15-03-33.jpg]]

>I've created another report based on Web source from ERPFRZN instance (Without OAuth authentication and authorization) called "TESTEMP"

![[23-Nov-20 15-13-29.jpg]]
>
>The both reports displayed side by side on the application at APX instance

![[23-Nov-20 15-09-22.jpg]]


##Feasibility test of "REST Enabled Object"

> In ERPDEV: I've enabled the  OPU_APEX_STREETS table

![[23-Nov-20 15-38-45.jpg]]
>In ERPDEV: I've connected the Privilege to my ERPAPX role and my module 

![[23-Nov-20 15-40-48.jpg]]

> in APX:
>  I've created the web source as before but :
>  1. With the type "Oracle REST Data Services"
>  2. Adding the POST operation:

![[23-Nov-20 16-12-46.jpg]]
![[23-Nov-20 16-13-34.jpg]]

> Creating Interactive Grid with an Insert option:

![[23-Nov-20 15-49-42.jpg]]
![[23-Nov-20 15-50-27.jpg]]

>Some insertion of data..

![[23-Nov-20 15-54-50.jpg]]

>It's added to the OPU_APEX.OPU_APEX_streets in ERPDEV:

```sql
SELECT * from  OPU_APEX.OPU_APEX_streets
WHERE semel_rehov = '50505050';
```

| SEMEL_ISHUV	| SEMEL_REHOV |	REHOV_NAME |
|---- 	| ----| ----- | 
|	123456	| 50505050 |	רחוב סומסום | 



#op/apex/infrastractures
#op/erp/po
#op/erp/apex
#op/apex/management