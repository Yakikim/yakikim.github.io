---
layout: mynote
tags: [documents, spec, op, management, infrastructures]  
created: 2021-07-01 16:47
modified: 2021-07-01 16:47
type: Document
title: 2021-07-01N3
---
[[2021-06-27]]
#  APEX Application level testing
[[home]]/[[Open University]]/[[APEX]]

## RestEnabledSQL
Interactive Grid:
through the wizard like: 
<iframe width="560" height="315" src="https://www.youtube.com/embed/7QIV96-iZoQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## APEX_EXEC
```sql 
apex_exec.execute_remote_plsql(p_server_static_id => ,p_plsql_code => )
```
to check:
```sql
declare

 l_params apex_exec.t_parameters;

begin 

 apex_exec.execute_rest_source(p_static_id => 'SEMESTER_FROM_ORA',

 p_operation => 'GET',

 p_parameters => l_params);

:P2_RESPONSE := apex_exec.GET_PARAMETER_VARCHAR2(l_params,'RESPONSE');

end;
```

#op/apex/infrastractures
#op/erp/po
#op/erp/apex
#op/apex/management