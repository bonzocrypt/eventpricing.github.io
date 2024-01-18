function toFixed2(value) {
   n = Math.round(value*100)/100;
   if (n == Math.round(n)) return n+".00";
   else if (n*10 == Math.round(n*10)) return n+"0";
   else return String(n);
}

function itemCosts() {
   orderForm = document.WebQuoteForm;
   item1 = parseFloat(orderForm.cost1.value);
   item2 = parseFloat(orderForm.cost2.value);
   item3 = parseFloat(orderForm.cost3.value);
   return (item1+item2+item3);
}

function calcTotal() {
   orderForm=document.WebQuoteForm;
   ordercost = itemCosts();
   ordertotal = ordercost;
   orderForm.total.value = toFixed2(ordertotal);   
}

function calcCost(item) {
   orderForm=document.WebQuoteForm;
   price = orderForm.elements["price"+item];
   qty = orderForm.elements["qty"+item];
   cost = orderForm.elements["cost"+item];
   reqty = /^\d+$/;

   if (reqty.test(qty.value)) {
      cost.value = toFixed2(price.value*qty.value);
      calcTotal();    
   } else {
      alert("Please enter an integer greater than or equal to 0");
      qty.value=0;
      qty.focus();
      qty.select();
      calcCost(item);
   }      
}
