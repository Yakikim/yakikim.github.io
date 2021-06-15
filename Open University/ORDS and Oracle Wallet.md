---
tags: [documents, spec, op, apex, wallet, oracle, ords, infrastructure]  
created: 2021-06-07 10:08
modified: 2021-06-07 10:23
type: Document
title: ORDS and Oracle Wallet
---
[[2021-06-06]]
# ORDS and Oracle Wallet
[[index]]/[[Open University]]/[[APEX]]/[[Infrastructure]]



*Source: [Oracle Base](https://oracle-base.com/articles/misc/oracle-rest-data-services-ords-create-basic-rest-web-services-using-plsql)*


Example of the secret retrieved and url to use:

```
CLIENT_ID     : Nma7-M8tIbuUohRMvp8THw..
CLIENT_SECRET : WPXkav_e6swd83SnHzaIdg..
OAUTH URL     : https://apex-erp-devtest.openu.ac.il:8443/erpdev/api/oauth/token
```

```bash
curl -i -k --user XD14IEhGf6nBgBbPr6oBjg..:r7mvz9iUIfnWKDjvPNpQmg.. --data "grant_type=client_credentials" https://apex-erp-devtest.openu.ac.il:8443/erpnewt/api/oauth/token

{
    "access_token": "uXY6G6Uj0G64ipLKT_qnOA..",
    "token_type": "bearer",
    "expires_in": 3600
}

curl -i -k -H"Authorization: Bearer DY7cKEr2-FaoTWgz_L23Tw.." https://apex-erp-devtest.openu.ac.il:8443/erpnewt/api/v1/employees/7788
```

```bash
curl --location -k \
'https://apex-erp-devtest.openu.ac.il:8443/erpfrzn/api/v1/employees/7788' \
--header 'Authorization: Bearer uXY6G6Uj0G64ipLKT_qnOA..' 
```

## Create an Oracle Wallet Containing the Certificates

This is done on the Apex UI DB

*Source :[Oracle Base](https://oracle-base.com/articles/misc/utl_http-and-ssl)*

```bash 
rm -rf $ORACLE_HOME/wallet
mkdir -p $ORACLE_HOME/wallet
```
```bash
orapki wallet create -wallet $ORACLE_HOME/wallet -pwd ********* -auto_login
```
```bash
<!-- orapki wallet add -wallet $ORACLE_HOME/wallet -trusted_cert -cert "/home/oracle/erp-apex-dev-ca.cer" -pwd *********
```
```bash
orapki wallet add -wallet $ORACLE_HOME/wallet -trusted_cert -cert "/home/oracle/bundle_ca.pem" -pwd ********* -->
```
```bash
orapki wallet add -wallet $ORACLE_HOME/wallet -user_cert  -cert "/home/oracle/apex-erp-devtest.openu.ac.il.pfx" -pwd *********
 ```
```bash
orapki wallet display -wallet $ORACLE_HOME/wallet
```

```bash
sqlplus / as sysdba
```
```sql
select UTL_HTTP.request(
  'https://apex-erp-devtest.openu.ac.il:8443/erpnewt/api/v1/employees/' ,
  null,
  'file:/u01/app/oracle/product/12.1.0.2/db_1/wallet', 
  '*********'
) from dual;

```
```bash

cd /u01/ords
$JAVA_HOME/bin/java -jar ords.war set-property restEnabledSql.active true
```



#op/apex/infrastractures
#op/erp/po
#op/erp/apex
#op/apex/management