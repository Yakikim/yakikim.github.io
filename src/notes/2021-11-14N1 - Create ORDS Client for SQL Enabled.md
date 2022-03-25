---
layout: mynote
tags: [infrastructures, apex, op, ords, rest] 
created: 2021-11-14 18:14
modified: 2021-11-14 18:14
type: Document
title:  Create ORDS Client for SQL Enabled 
---
Week Of: [[2021-11-14]]
[[2021-11-14]]


#  תזכיר בנושא  Create ORDS Client for SQL Enabled


[[home]]/[[Open University]]/[[APEX]]

## רקע\תיאור

## ​Securing REST Enabled SQL

In view of this warning described above, I advise that you create an entirely separate schema for use with REST enabled SQL (and make the schema password very complex). This at least limits your exposure to that one schema. Added to that, you should also avoid using Schema Authentication (i.e. use schema name and password) whenever possible and instead use OAUTH2 Client Credentials Authentication.  
   
If a third party needs to access your database using REST enabled SQL, setup OAUTH2 Client Credentials Authentication by performing the following steps:

-   Create a new schema e.g. SYSTEMX
-   Login as SYSTEMX and run ords.enable_schema to enable ORDS in the schema
-   Create the appropriate grants to the schema SYSTEMX for the tables and views you want to provide access to.
-   Create an OAUTH client and assign the role ‘SQL Developer’
-   Provide the client with the client_id and client_secret values from the table ORDS_METADATA.OAUTH_CLIENTS.
-   The client would then use the client id and secret to get a token and use that and would never know the schema password.

```plsql

BEGIN

  -- ORDS Enable the Schema

  ords.enable_schema;

  -- Create OAUTH Client.

oauth.create_client(

    p_name            => 'RESTSQL',

    p_description     => 'Rest Enabled SQL Client',

    p_grant_type      => 'client_credentials',

    p_support_email   => 'yakiki@openu.ac.il',

    p_privilege_names => NULL);
   
  oauth.grant_client_role('RESTSQL', 'SQL Developer');

  COMMIT;


 END;
   
```
​Unfortunately, even when you configure OAUTH2 Client Credentials Authentication you can still use Schema Authentication. I would like to see a way of turning Schema Authentication off for a schema that has OAUTH2 Client Credentials Authentication.


#memo #op/memo
