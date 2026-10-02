const ITEMS_STORAGE_KEY="oshikatsu-items";

function normalizeTiming(timing){
    return timing==="morning"?"morning":"night";
}

function getItems(){
    const saved=localStorage.getItem(ITEMS_STORAGE_KEY);
    if(!saved)return [];
    try{
        const items=JSON.parse(saved);
        if(!Array.isArray(items))return [];
        return items.map(item=>({...item,timing:normalizeTiming(item.timing)}));
    }catch(error){
        console.error("持ち物データの読み込みに失敗しました。",error);
        return [];
    }
}

function saveItems(items){
    localStorage.setItem(ITEMS_STORAGE_KEY,JSON.stringify(items));
}

function createItemId(){
    return Date.now().toString(36)+Math.random().toString(36).substring(2,9);
}

function addItem(name,timing="night"){
    const trimmedName=name.trim();
    if(!trimmedName)return false;
    const items=getItems();
    items.push({
        id:createItemId(),
        name:trimmedName,
        checked:false,
        timing:normalizeTiming(timing)
    });
    saveItems(items);
    return true;
}

function toggleItem(id){
    const items=getItems();
    const item=items.find(item=>item.id===id);
    if(!item)return false;
    item.checked=!item.checked;
    saveItems(items);
    return true;
}

function setItemTiming(id,timing){
    const items=getItems();
    const item=items.find(item=>item.id===id);
    if(!item)return false;
    item.timing=normalizeTiming(timing);
    saveItems(items);
    return true;
}

function deleteItem(id){
    const items=getItems();
    saveItems(items.filter(item=>item.id!==id));
}