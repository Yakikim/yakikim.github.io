---
layout: mynote
tags: [notes, memo, op, wallet, httprequest, plsql, professional] 
created: 2021-08-09 12:09
modified: 2021-08-09 12:09
type: Document
title: תזכיר  2021-08-09
---
Week Of: [[2021-08-08]]
[[2021-08-09]]

# תזכיר הרצת Request  מתוך ה-DB
[[home]]/[[Open University]]/[[Memos]]
[[General/PL-SQL]]
## דוגמא שעובדת ובשימוש
```plsql
DECLARE
  L_SQL_PARAMETERS APEX_EXEC.T_PARAMETERS;
BEGIN

  APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'APP_USER_ID', '');
  APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'APP_USER', :APP_USER);
  APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'APP_PERSON_NAME', '');
  APEX_EXEC.ADD_PARAMETER(L_SQL_PARAMETERS, 'APP_USER_ZEHUT', '');
  APEX_EXEC.EXECUTE_REMOTE_PLSQL(P_SERVER_STATIC_ID   => 'ERP_NEWT',
                                 P_PLSQL_CODE         => q'#
begin
begin
select user_id into :APP_USER_ID
from apps.fnd_user
where user_name = :APP_USER;
:APP_PERSON_NAME := apps.apex_erp_general_pkg.get_user_dtl(:APP_USER);
exception
     when others then 
     :APP_USER_ID := -1;
   end;
begin
  SELECT MIS_ZEHUT   
  into :APP_USER_ZEHUT
  FROM APPS.OP_EMPLOYEE_DATA_MV
  WHERE username = :APP_USER;
exception
when others then
  :APP_USER_ZEHUT := '999999999';
  end;
end;
#',
                                 P_AUTO_BIND_ITEMS => FALSE,
                                 P_SQL_PARAMETERS => L_SQL_PARAMETERS);
  :APP_USER_ID := APEX_EXEC.GET_PARAMETER_VARCHAR2(P_PARAMETERS => L_SQL_PARAMETERS,
                                                      P_NAME => 'APP_USER_ID');
  :APP_PERSON_NAME := APEX_EXEC.GET_PARAMETER_VARCHAR2(P_PARAMETERS => L_SQL_PARAMETERS,
                                                      P_NAME => 'APP_PERSON_NAME');
  :APP_USER_ZEHUT := APEX_EXEC.GET_PARAMETER_VARCHAR2(P_PARAMETERS => L_SQL_PARAMETERS,
                                                      P_NAME => 'APP_USER_ZEHUT');
  :APP_FROM_MAIL := 'tachbura@openu.ac.il';
END;
```

## דוגמא שלא עובדת
``` plsql
SELECT utl_http.request(URL =>'https://apex-erp-devtest.openu.ac.il:8443/erpnewt/api/v1/employees/7499', wallet_path => 'oracle/DB/12.2/product/owm/wallets',wallet_password => 'Apx21182010') FROM dual;
```
## דוגמא שכן עובדת
```plsql
select apex_web_service.make_rest_request(
p_url         => --'http://octopuson7-web.openu.ac.il/move_files.json', 
'https://apex-erp-devtest.openu.ac.il:8443/erpnewt/api/v1/employees/7499' , 
p_http_method => 'GET' --,
--p_token_url => 'https://apex-erp-devtest.openu.ac.il:8443/erpfrzn/api/oauth/token',
--p_wallet_path => <wallet_path>,
--p_wallet_pwd => <wallet_pwd>
) from dual;
```

## מסקנות ופעולות

- [ ] 
 

#memo 
#op/memo