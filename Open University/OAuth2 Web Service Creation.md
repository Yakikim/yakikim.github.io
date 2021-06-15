---
tags: [apex, op, wiki, guide]  
created: 2021-05-24 16:57
modified: 2021-05-31 14:53
type: Document
title: OAuth2 Web Service Creation
---

[[2021-01-02]]

# OAuth2 Web Service Creation

[[index]]/[[Open University]]/[[APEX]]/[[Infrastructure]]

> Note: Guide for consumption of service is available here: [[OP/consumption of Web Services]]
## Enable Schema ORDS

```sql
CONN testuser1/testuser1@pdb1

BEGIN
  ORDS.enable_schema(
    p_enabled             => TRUE,
    p_schema              => 'APPS',
    p_url_mapping_type    => 'BASE_PATH',
    p_url_mapping_pattern => 'api',
    p_auto_rest_auth      => FALSE
  );
    
  COMMIT;
END;
/
```

## Create GET Web Services

```sql
BEGIN
  ORDS.define_module(
    p_module_name    => 'v1',
    p_base_path      => 'v1/',
    p_items_per_page => 0);
  
  ORDS.define_template(
   p_module_name    => 'v1',
   p_pattern        => 'employees/');

  ORDS.define_handler(
    p_module_name    => 'v1',
    p_pattern        => 'employees/',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_collection_feed,
    p_source         => 'SELECT * FROM emp',
    p_items_per_page => 0);
    
  ORDS.define_template(
   p_module_name    => 'v1',
   p_pattern        => 'employees/:empno');

  ORDS.define_handler(
    p_module_name    => 'v1',
    p_pattern        => 'employees/:empno',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_collection_feed,
    p_source         => 'SELECT * FROM emp WHERE empno = :empno',
    p_items_per_page => 0);
    
  COMMIT;
END;
/
```


## [[ORDS]] Roles and Privileges

```sql
DECLARE
  l_roles     OWA.VC_ARR;
  l_modules   OWA.VC_ARR;
  l_patterns  OWA.VC_ARR;
BEGIN
  ORDS.create_role(
    p_role_name => 'emp_role'
  );

  l_roles(1)   := 'emp_role';
  l_modules(1) := 'v1';
  l_patterns(1):= '/employees/*';
  ORDS.DEFINE_PRIVILEGE(
      p_privilege_name => 'emp_priv',
      p_roles          => l_roles,
      p_patterns       => l_patterns,
      p_modules        => l_modules,
      p_label          => 'EMP Data',
      p_description    => 'Allow access to the EMP data.',
      p_comments       => NULL);      

  COMMIT;
END;
/

```
### Viewing the Data  
###### Display the role.  
>
>
```sql
SELECT id, name
FROM   user_ords_roles
WHERE  name = 'emp_role';
```
>
|  ID   |  NAME   |
| -- | -- |
|  10729   |  emp_role   |


###### Display the privilege information.  
>
```sql
SELECT id, name
FROM   user_ords_privileges
WHERE  name = 'emp_priv';
```
 >
 |  ID  |  NAME  |
 | -- | -- |
 |	10730	|	 emp_priv	|

###### Display the privilege-role relationship.  
>
```sql
SELECT privilege_id, privilege_name, role_id, role_name
FROM   user_ords_privilege_roles
WHERE  role_name = 'emp_role';
```
>
| PRIVILEGE_ID | PRIVILEGE_NAME | ROLE_ID | ROLE_NAME |
| -------- | ---------- | ----- | ------ |
| 10730        | emp_priv       | 10729   | emp_role  |

###### Display the mapping information.  
>
```sql
SELECT privilege_id, name, pattern
FROM   user_ords_privilege_mappings
WHERE  name = 'emp_priv';
```
>
|PRIVILEGE_ID|	NAME|	PATTERN|
|--|--|
|10730| 	emp_priv	|/employees/* |


## OAuth :  Create Client Credentials

```sql
BEGIN
  OAUTH.create_client(
    p_name            => 'emp_client',
    p_grant_type      => 'client_credentials',
    p_owner           => 'My Company Limited',
    p_description     => 'A client for Emp management',
    p_support_email   => 'tim@example.com',
    p_privilege_names => 'emp_priv'
  );

  COMMIT;
END;
/
```
###### Display client details.  
>
```sql
SELECT id, name, client_id, client_secret
FROM   user_ords_clients;
```
>
|ID	| NAME|	CLIENT_ID|	CLIENT_SECRET|
|--|--|--|
|10734|	emp_client|	TACaCWf699ULkPK9KQItuQ..|	GVAxa0df6kOLREt5cJa9BQ..|


###### Display client-privilege relationship.
>
```sql
SELECT name, client_name
FROM   user_ords_client_privileges;
```
>
|NAME|	CLIENT_NAME|
|--|--|
|emp_priv|	emp_client|

### Grant Role to Client
```sql
BEGIN
  OAUTH.grant_client_role(
    p_client_name => 'emp_client',
    p_role_name   => 'emp_role'
  );

  COMMIT;
END;
/
```

###### Display client-role relationship.
>
```sql
SELECT client_name, role_name
FROM   user_ords_client_roles;
```
>
|CLIENT_NAME	|ROLE_NAME|
| -- | -- |
|emp_client|	emp_role|

#### Same Schema Without OAuth:

Base ORDS URL : https://apex-erp-devtest.openu.ac.il:8443/erpdev/

Schema (alias): https://apex-erp-devtest.openu.ac.il:8443/erpdev/api/

Module        : https://apex-erp-devtest.openu.ac.il:8443/erpdev/api/v1/

Template      : https://apex-erp-devtest.openu.ac.il:8443/erpdev/api/v1/employees/

Example:        https://apex-erp-devtest.openu.ac.il:8443/erpdev/api/v1/employees/7499
#### With OAuth 
Base ORDS URL : https://apex-erp-devtest.openu.ac.il:8443/erpdev/

Schema (alias): https://apex-erp-devtest.openu.ac.il:8443/erpdev/testuser1/

Module        : https://apex-erp-devtest.openu.ac.il:8443/erpdev/testuser1/v1/

Template      : https://apex-erp-devtest.openu.ac.il:8443/erpdev/testuser1/v1/employees/

Example:        https://apex-erp-devtest.openu.ac.il:8443/erpdev/testuser1/v1/employees/7499
## Example of the secret retrieved and url to use:

```
CLIENT_ID     : TACaCWf699ULkPK9KQItuQ..
CLIENT_SECRET : GVAxa0df6kOLREt5cJa9BQ..
OAUTH URL     : https://apex-erp-devtest.openu.ac.il:8443/erpdev/testuser1/oauth/token
```

```bash
curl -i -k -- user TACaCWf699ULkPK9KQItuQ..:GVAxa0df6kOLREt5cJa9BQ.. ####data "grant_type=client_credentials" https://apex-erp-devtest.openu.ac.il:8443/erpdev/testuser1/oauth/token

{
    "access_token": "S5qj7olQbVX38fa-S7pZVQ..",
    "token_type": "bearer",
    "expires_in": 3600
}

curl -i -k -H"Authorization: Bearer S5qj7olQbVX38fa-S7pZVQ.." https://apex-erp-devtest.openu.ac.il:8443/erpdev/testuser1/v1/employees/7788

```



