---
tags: [documents, spec, op, po , queries,  initiation, erp]  
created: 2021-01-06 17:23
modified: 2021-05-27 17:34
type: Document
title: שליפות נתונים בשימוש מסמך הייזום כיום
link: [[Initiation Form - Queries|איפיון טופס ייזום - שליפות נתונים ]]
---

[[2021-05-23]]

#   שליפות נתונים בשימוש מסמך הייזום כיום	

[[index.html]]/[[Open University]]/[[ERP]]/[[טופס ייזום]]
[[index.html]]/[[Open University]]/[[APEX]]/[[טופס ייזום]]

## 5.1                פרטי היוזם –  שליפה בטופס קיים

```sql 
BEGIN  -------------------------טלפון של היוזם

SELECT B.PHONE_NUMBER

INTO   V_PHONE

FROM   per_people_x A,

       PER_PHONES B

WHERE  A.PERSON_ID = nvl(V_EMPLOYEE_ID_S,V_EMPLOYEE_ID) AND

       A.PERSON_ID = B.PARENT_ID   AND

       B.PARENT_TABLE = 'per_people_x' AND

       B.PHONE_TYPE = 'W1';

EXCEPTION

  WHEN NO_DATA_FOUND THEN NULL;

END;

 

BEGIN   -----------------------------מחלקה אירגונית

SELECT FFVTL.DESCRIPTION UNIT_DESCRIPTION,

       FFV.FLEX_VALUE UNIT_CODE

INTO   V_TEUR_MACHLAKA,

       V_KOD_MACHLAKA

FROM   per_people_x PE,

       per_all_assignments_f ASS ,

       PER_ALL_POSITIONS POS ,

       FND_FLEX_VALUES FFV ,

       FND_FLEX_VALUES_TL FFVTL ,

       FND_ID_FLEX_SEGMENTS FFS

WHERE  PE.PERSON_ID = nvl(V_EMPLOYEE_ID_S,V_EMPLOYEE_ID)  and

      (TRUNC(ASS.EFFECTIVE_START_DATE ) <= SYSDATE) AND (TRUNC(ASS.EFFECTIVE_END_DATE ) >= SYSDATE)

       AND ASS.primary_flag = 'Y'

       AND PE.PERSON_ID = ASS.PERSON_ID

       AND ASS.POSITION_ID = POS.POSITION_ID

       AND SUBSTR(POS.NAME , 1,6) = FFV.FLEX_VALUE

       AND FFV.FLEX_VALUE_SET_ID = FFS.FLEX_VALUE_SET_ID

       AND FFV.FLEX_VALUE_ID = FFVTL.FLEX_VALUE_ID

       AND FFS.ID_FLEX_CODE = 'POS'

       AND FFS.APPLICATION_COLUMN_NAME = 'SEGMENT1'

       AND FFVTL.LANGUAGE = 'IW';

EXCEPTION

   WHEN NO_DATA_FOUND THEN NULL;

END;
```

## 5.2                מופנה אל גורם מקצועי – שליפה בטופס קיים
```sql 

if V_STATUS_LINE = 1 or V_STATUS_LINE is null then

    htp.p('<select name="in_kod_profession" onchange="find_paritav(this)">');

    htp.p('<option value="">נא בחר');

        for rec in(select FLEX_VALUE,DESCRIPTION

                   from   fnd_flex_values a,

                          fnd_flex_values_tl b,

                          malam.op_paritav_erp p

                    where  a.flex_value_id=b.flex_value_id and

                           b.language ='IW' and

                           a.flex_value_set_id = '1005432' and

                           p.KOD_PROFESSION = FLEX_VALUE

                     group by FLEX_VALUE,DESCRIPTION

                     order by FLEX_VALUE)

       loop

        htp.p('<OPTION VALUE="'||rec.FLEX_VALUE||'"');

        if V_KOD_PROFESSION  = rec.FLEX_VALUE then

            htp.p(' selected');

        end if;

        htp.p('<font  face="Arial" size="2">');

        htp.p(''||rec.FLEX_VALUE ||'&nbsp;&nbsp;' ||rec.description);

        htp.p('</font>');

      end loop;

htp.p('</select>');

else

   begin

     SELECT DESCRIPTION

     INTO   V_TEUR_PROFESSION

     from   fnd_flex_values a,

             fnd_flex_values_tl b

      where  a.flex_value_id=b.flex_value_id and

             b.language ='IW' and

             a.flex_value_set_id = '1005432' AND

             FLEX_VALUE = V_KOD_PROFESSION;

      EXCEPTION

         WHEN NO_DATA_FOUND THEN NULL;

   end;

   htp.p('<font  face="Arial" size="2">'||V_KOD_PROFESSION||' -'||V_TEUR_PROFESSION||'</font>');

   htp.p('<input type=hidden name=in_kod_profession value="'||V_KOD_PROFESSION||'">');

end if;
```

## 5.3                שם מנהל מחלקה מאשר – שליפה בטופס קיים
```sql
for rec in(SELECT  DISTINCT (B.FULL_NAME) superior ,

                   SUPERIOR_ID

           FROM    PO_EMPLOYEE_HIERARCHIES_ALL  A,

                   per_people_x           B,

                   per_position_structures    c

            WHERE C.POSITION_STRUCTURE_ID = A.POSITION_STRUCTURE_ID

                AND   A.SUPERIOR_ID           = B.PERSON_ID

                AND   A.POSITION_STRUCTURE_ID = 45

                AND SUPERIOR_LEVEL = 1

            order by full_name)

LOOP

htp.p('<OPTION VALUE="'||rec.SUPERIOR_ID||'"');

if v_NAME_SUPERIOR  = rec.SUPERIOR_ID then

    htp.p(' selected');

end if;

htp.p('<font  face="Arial" size="2">');

htp.p(rec.superior);

htp.p('</font>');

END LOOP;
```

## 5.4                פרטי אב\שירות – שליפה בטופס קיים
 
```sql 
if in_status_peilut ='y' then

   htp.p('<select name="in_parit_av" >');

   htp.p('<option value="">נא בחר');

   for rec in(select KOD_PARIT_AV,

                     TEUR_PARIT_AV

              from   malam.op_paritav_erp

              where  KOD_PROFESSION = V_KOD_PROFESSION

              order by TEUR_PARIT_AV)

   loop

     htp.p('<OPTION VALUE="'||rec.KOD_PARIT_AV||'"');

     if V_KOD_PARIT_AV  = rec.KOD_PARIT_AV then

       htp.p(' selected');

     end if;

     htp.p('<font  face="Arial" size="2">');

     htp.p(''|| rec.TEUR_PARIT_AV||'');

     htp.p('</font>');

    end loop;

    htp.p('</select>

    ');

else

   begin

   select TEUR_PARIT_AV

   into   v_teur_parit

   from   malam.op_paritav_erp

   where  KOD_PARIT_AV = V_KOD_PARIT_AV  and

          KOD_PROFESSION = V_KOD_PROFESSION;

   exception

      when no_data_found then null;

   end;

htp.p('

<input type="text" name="" size="30" maxlength="200" value="'||v_teur_parit||'" disabled>

<input type="hidden" name="in_parit_av" size="30" maxlength="200" value="'||V_KOD_PARIT_AV||'">');

 

end if;
```

## 5.5                מטבע – שליפה בטופס קיים
```sql
for rec in(select b.currency_code code ,

                  b.name name

           from   fnd_currencies a,

                  fnd_currencies_tl b

           where  a.currency_code = b.currency_code and

                  (a.end_date_active is null or

                   a.end_date_active > sysdate)     and

                   b.language = 'IW'  and

                   a.enabled_flag = 'Y' and

                   a.currency_flag = 'Y'

           order by name)

loop

 

htp.p('<OPTION VALUE="'||rec.code||'"');

IF rec.code = V_currency THEN

   htp.p(' selected');

END IF;

htp.p('<font  face="Arial" size="2">');

htp.p('' || rec.name);

htp.p('</font>');

end loop;
```

## 5.6                אתר אספקה – שליפה בטופס קיים
```sql
for rec in(select location_id,

                   location_code,

                   DESCRIPTION

           from   hr.hr_locations_all

           where nvl(inactive_date,sysdate+1)>sysdate /*Haggit Cust 13621 02.07.2019*/

          order by  location_code)

loop

htp.p('<OPTION VALUE="'||rec.location_id||'"');

IF V_LOCATION =  rec.location_id THEN

   htp.p(' selected');

END IF;

htp.p('<font  face="Arial" size="2">');

htp.p(''||rec.location_code||'');

htp.p('</font>');

end loop;
```

## 5.7                מילוי ע"י גורם מקצועי – שליפה בטופס קיים
```sql
if V_STATUS_LINE = 5 then

     IF nvl(in_mikum_tofes,'*') <> 'c' THEN

         htp.p('<INPUT TYPE="radio" NAME="in_status_yad" value="5" checked>');

     ELSE

         htp.p('<INPUT TYPE="radio" NAME="in_status_yad" value="5">');

     END IF;

  else

    htp.p('<INPUT TYPE="radio" NAME="in_status_yad" value="5">');

  end if;

   htp.p('&nbsp;

   <font  face="Arial" color="#31659C" size="2">ניפוק מהמלאי</font>');

  if V_STATUS_LINE = 6 then

   IF nvl(in_mikum_tofes,'*') <> 'c' THEN

     htp.p('<INPUT TYPE="radio" NAME="in_status_yad" value="6" checked>');

   ELSE

      htp.p('<INPUT TYPE="radio" NAME="in_status_yad" value="6">');

   END IF;

  else

    htp.p('<INPUT TYPE="radio" NAME="in_status_yad" value="6">');

  end if;
```

##        גורם מקצועי
```sql 
CURSOR C_GOREM IS

select FLEX_VALUE,DESCRIPTION

from   fnd_flex_values a,

       fnd_flex_values_tl b

where  a.flex_value_id=b.flex_value_id and

       b.language ='IW' and

       a.flex_value_set_id = '1005432'

order by FLEX_VALUE;

 

CURSOR C_GOREM1(v_KOD_PROFESSION_2 varchar2) IS

select FLEX_VALUE,DESCRIPTION

from   fnd_flex_values a,

       fnd_flex_values_tl b

where  a.flex_value_id=b.flex_value_id and

       b.language ='IW' and

       a.flex_value_set_id = '1005432' and

       FLEX_VALUE = v_KOD_PROFESSION_2

order by FLEX_VALUE;

```


##           פריט אב
```sql
CURSOR C_PARIT_AV(V_KOD_PROFESSION1 varchar2) IS

 select KOD_PARIT_AV,

        TEUR_PARIT_AV

 from   malam.op_paritav_erp

 WHERE  KOD_PROFESSION = V_KOD_PROFESSION1;

 

 

CURSOR C_PARIT_AV1 IS

 select KOD_PARIT_AV,

        TEUR_PARIT_AV

        KOD_PROFESSION

 from   malam.op_paritav_erp;
```
 

##         סגמנטים תקציביים
```sql 
CURSOR C_CITE IS

SELECT flex_value

FROM   fnd_flex_value_sets vs,

       fnd_flex_values val,

       fnd_flex_values_tl valtl

WHERE  vs.flex_value_set_id = val.flex_value_set_id

       AND val.flex_value_id = valtl.flex_value_id

       --AND flex_value = in_site

       AND valtl.LANGUAGE = 'IW'

       AND val.enabled_flag = 'Y'

       AND NVL(val.end_date_active , SYSDATE+1) > SYSDATE

       AND vs.flex_value_set_name = 'MLM_SITE'

       AND val.summary_flag = 'N';

 

 

CURSOR C_FUND IS

SELECT val.flex_value

FROM   fnd_flex_value_sets vs,

       fnd_flex_values val,

       fnd_flex_values_tl valtl

WHERE  vs.flex_value_set_id = val.flex_value_set_id

         AND val.flex_value_id = valtl.flex_value_id

       AND valtl.LANGUAGE = 'IW'

       AND val.enabled_flag = 'Y'

       AND NVL(val.end_date_active , SYSDATE+1) > SYSDATE

       AND vs.flex_value_set_name = 'MLM_FUND'

       AND val.summary_flag = 'N';

 

CURSOR C_ACCOUNT  IS

SELECT flex_value

FROM   fnd_flex_value_sets vs,

                fnd_flex_values val,

                fnd_flex_values_tl valtl

WHERE  vs.flex_value_set_id = val.flex_value_set_id

       AND val.flex_value_id = valtl.flex_value_id

       AND valtl.LANGUAGE = 'IW'

       AND val.enabled_flag = 'Y'

       AND NVL(val.end_date_active , SYSDATE+1) > SYSDATE

       AND vs.flex_value_set_name = 'MLM_ACCOUNT'

       AND val.summary_flag = 'N'

       AND val.flex_value IN  ('17114','60001','60006','62001','62002','62003','62010',

                                '62030','62040','62050','62200','62060','62004','62008','62005');

 

 

 

CURSOR C_DEPARTMENT   IS

SELECT flex_value

FROM     fnd_flex_value_sets vs,

                  fnd_flex_values val,

                  fnd_flex_values_tl valtl

WHERE  vs.flex_value_set_id = val.flex_value_set_id

           AND val.flex_value_id = valtl.flex_value_id

           AND valtl.LANGUAGE = 'IW'

           AND val.enabled_flag = 'Y'

           AND NVL(val.end_date_active , SYSDATE+1) > SYSDATE

          AND vs.flex_value_set_name = 'MLM_DEPARTMENT'

          AND val.summary_flag = 'N';

 

 

 

 

CURSOR C_TATCHESHBON   IS

SELECT flex_value

FROM   fnd_flex_value_sets vs,

       fnd_flex_values val,

       fnd_flex_values_tl valtl

WHERE  vs.flex_value_set_id = val.flex_value_set_id

       AND val.flex_value_id = valtl.flex_value_id

       AND valtl.LANGUAGE = 'IW'

       AND val.enabled_flag = 'Y'

       AND NVL(val.end_date_active , SYSDATE+1) > SYSDATE

       AND vs.flex_value_set_name = 'MLM_SUB_ACCOUNT'

       AND val.summary_flag = 'N';

 

 CURSOR C_PROJECT   IS

 SELECT flex_value

FROM   fnd_flex_value_sets vs,

       fnd_flex_values val,

       fnd_flex_values_tl valtl

WHERE  vs.flex_value_set_id = val.flex_value_set_id

       AND val.flex_value_id = valtl.flex_value_id

       AND valtl.LANGUAGE = 'IW'

       AND val.enabled_flag = 'Y'

       AND NVL(val.end_date_active , SYSDATE+1) > SYSDATE

       AND vs.flex_value_set_name = 'MLM_PROJECT_OR_RESEARCH'

       AND val.summary_flag = 'N';

 ```
 