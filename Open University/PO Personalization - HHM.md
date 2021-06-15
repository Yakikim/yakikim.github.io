---
tags: [documents, spec, op, po]  
created: 2021-06-14 10:04
modified: 2021-06-14 10:04
type: Document
title: PO Personalization - HHM
---
[[2021-06-13]]
# PO Personalization - HHM
[[index.html]]/[[Open University]]/[[ERP]]/[[Purchasing]]

# הוספת ערך סטטוס חוק חובת המכרזים  

1. Value Set: OP_ORDER_LAW_TYPE

![[LOV1.png]]
### כל הסעיפים הבאים אוחזרו מאוחר יותר לבקשת המשתמשים (21/03)
2. Changing the vales at the "Position Hierarchy":  

| From | to |
|-- | -- |
| הזמנות והסכמים - מסלול רגיל | רכש - מסלול רגיל |
|הזמנות והסכמים - ועדת רכש | רכש - ועדת מרכזים\כח אדם |


2. PO Approve Form Personalization:   
יש לעדכן פה גם את ה-Action ![](PERSONALIZATION1.PNG)  
![](PERSONALIZATION3.PNG)   


3. RELEASE Approve Form Personalization:  

![](PERSONALIZATION2.PNG) 
![](PERSONALIZATION5.PNG)
![](PERSONALIZATION6.PNG)

4. Compiling xxpo_po_wf_notif_pkg.op_set_approver_att   

> שים לב!  
 לפני ביצוע הקימפול יש לבצע הורדה של ה-Workflow כך שלא תיווצר נפילה של WF שקורה ל-Package הזה.


``` sql

 PROCEDURE op_set_approver_att(itemtype  IN VARCHAR2,
                                itemkey   IN VARCHAR2,
                                actid     IN NUMBER,
                                funcmode  IN VARCHAR2,
                                resultout OUT NOCOPY VARCHAR2) is
    l_document_id   number;
    v_attribute12   po_headers_all.attribute12%type;
    v_created_by    number;
    v_from_name     per_all_people_f.full_name%type;
    v_forward_to_id number;
    v_type_lookup_code po_headers_all.type_lookup_code%type;
  BEGIN
    IF (funcmode <> wf_engine.eng_run) THEN
    
      resultout := wf_engine.eng_null;
      RETURN;
    
    END IF;
  
    l_document_id := po_wf_util_pkg.getitemattrnumber(itemtype => itemtype,
                                                      itemkey  => itemkey,
                                                      aname    => 'DOCUMENT_ID');
  
    if fnd_profile.VALUE('OP_PO_HHM_OVERWRITE_PATH') = 'Y' then
      /*Haggit 10.01.2019 Cust 11993*/
      begin
        select h.attribute12, h.created_by, h.type_lookup_code
          into v_attribute12, v_created_by, v_type_lookup_code
          from po_headers_all h
         where h.po_header_id = l_document_id;
      exception
        when no_data_found then
          select h.attribute12, r.created_by 
            into v_attribute12, v_created_by
            from po_releases_all r, po_headers_all h
           where r.po_header_id = h.po_header_id
             and r.po_release_id = l_document_id;
        when others then
          v_attribute12 := null;
          v_created_by  := null;
      end;
      begin
        select p.full_name
          into v_from_name
          from fnd_user u, per_all_people_f p
         where u.employee_id = p.person_id
           and u.user_id = v_created_by
           and sysdate between p.effective_start_date and
               p.effective_end_date;
      exception
        when others then
          v_from_name := null;
      end;
      if nvl(v_type_lookup_code,'-1')<> 'CONTRACT' then /*Haggit 09.12.2019 Add type_lookup_code condition*/
     if v_attribute12 in ('02', '03', '05','07')  then
      
        Wf_Engine.SetItemAttrNumber(itemtype => Itemtype,
                                    itemkey  => Itemkey,
                                    aname    => 'APPROVAL_PATH_ID',
                                    avalue   => 43);
      
        /* Wf_Engine.SetItemAttrNumber(itemtype => Itemtype,
        itemkey  => Itemkey,
        aname    => 'FORWARD_FROM_ID',
        avalue   => v_created_by);*/
      
        Wf_Engine.SetItemAttrNumber(itemtype => Itemtype,
                                    itemkey  => Itemkey,
                                    aname    => 'FORWARD_TO_ID',
                                    avalue   => 93);
      
        /* Wf_Engine.SetItemAttrText(itemtype => Itemtype,
        itemkey  => Itemkey,
        aname    => 'FORWARD_FROM_DISP_NAME',
        avalue   => v_from_name);*/
      
        Wf_Engine.SetItemAttrText(itemtype => Itemtype,
                                  itemkey  => Itemkey,
                                  aname    => 'FORWARD_TO_DISPLAY_NAME',
                                  avalue   => 'ועדת, מכרזים');
      
        Wf_Engine.SetItemAttrText(itemtype => Itemtype,
                                  itemkey  => Itemkey,
                                  aname    => 'APPROVER_DISPLAY_NAME',
                                  avalue   => 'ועדת, מכרזים');
      
        Wf_Engine.SetItemAttrText(itemtype => Itemtype,
                                  itemkey  => Itemkey,
                                  aname    => 'FORWARD_TO_USERNAME',
                                  avalue   => 'VAADATRECH');
      
      elsif v_attribute12 in ('01', '04', '06') then
        Wf_Engine.SetItemAttrNumber(itemtype => Itemtype,
                                    itemkey  => Itemkey,
                                    aname    => 'APPROVAL_PATH_ID',
                                    avalue   => 42);
      
        v_forward_to_id := Wf_Engine.GetItemAttrNumber(aname    => 'FORWARD_TO_ID',
                                                       itemkey  => Itemkey,
                                                       itemtype => Itemtype);
      
        if v_forward_to_id = 93 then
          Wf_Engine.SetItemAttrNumber(itemtype => Itemtype,
                                      itemkey  => Itemkey,
                                      aname    => 'FORWARD_TO_ID',
                                      avalue   => null);
        
          Wf_Engine.SetItemAttrText(itemtype => Itemtype,
                                    itemkey  => Itemkey,
                                    aname    => 'FORWARD_TO_DISPLAY_NAME',
                                    avalue   => null);
        
          Wf_Engine.SetItemAttrText(itemtype => Itemtype,
                                    itemkey  => Itemkey,
                                    aname    => 'APPROVER_DISPLAY_NAME',
                                    avalue   => null);
        
          Wf_Engine.SetItemAttrText(itemtype => Itemtype,
                                    itemkey  => Itemkey,
                                    aname    => 'FORWARD_TO_USERNAME',
                                    avalue   => null);
        end if;
      end if;
     end if;
      /******************************/
    end if;
END op_set_approver_att; 
```




#op/apex/infrastractures
#op/erp/po
#op/erp/apex
#op/apex/management